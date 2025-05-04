let isModalOpen = false;

const starterOptions = [
  {
    name: "Charmander",
    type: "Fire",
    maxHP: 60,
    sprite: "assets/charmander.png",
    moves: ["Tackle", "Ember"],
  },
  {
    name: "Squirtle",
    type: "Water",
    maxHP: 65,
    sprite: "assets/squirtle.png",
    moves: ["Tackle", "Water Gun"],
  },
  {
    name: "Bulbasaur",
    type: "Grass",
    maxHP: 70,
    sprite: "assets/bulbasaur.png",
    moves: ["Tackle", "Vine Whip"],
  },
];

const enemies = [
  {
    name: "Wild Rattata",
    sprite: "assets/enemy1.png",
    maxHP: 60,
    type: "Normal",
  },
  {
    name: "Wild Pidgey",
    sprite: "assets/enemy2.png",
    maxHP: 50,
    type: "Flying",
  },
  {
    name: "Wild Zubat",
    sprite: "assets/enemy3.png",
    maxHP: 55,
    type: "Poison",
  },
];

const attacks = {
  Tackle: { min: 5, max: 12, type: "Normal" },
  "Quick Attack": { min: 8, max: 14, type: "Normal" },
  Thunderbolt: { min: 10, max: 20, type: "Electric" },
  Ember: { min: 10, max: 16, type: "Fire" },
  "Water Gun": { min: 10, max: 16, type: "Water" },
  "Vine Whip": { min: 10, max: 16, type: "Grass" },
};

// Simple type effectiveness chart
const typeEffectiveness = {
  Fire: { Grass: 2.0, Water: 0.5, Fire: 1.0 },
  Water: { Fire: 2.0, Grass: 0.5, Water: 1.0 },
  Grass: { Water: 2.0, Fire: 0.5, Grass: 1.0 },
  Electric: {
    Flying: 2.0, // Super effective
    Normal: 1.0,
    Poison: 1.0,
  },
  Normal: {
    Flying: 1.0,
    Normal: 1.0,
    Poison: 1.0,
  },
};

const savedTeam = localStorage.getItem("myTeam");
const team = savedTeam ? JSON.parse(savedTeam) : [];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let battle = {
  playerHP: 100,
  enemyHP: 50,
  inBattle: false,
};

const tileSize = 40;
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 2, 2, 2, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 2, 2, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 1, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const savedPlayer = localStorage.getItem("playerData");
const player = savedPlayer
  ? JSON.parse(savedPlayer)
  : {
      x: 1,
      y: 1,
      level: 1,
      xp: 0,
      maxHP: 100,
      currentHP: 100,
    };

let inventory = {
  potion: 0,
  superPotion: 0,
  pokeball: 0,
};

const savedInventory = localStorage.getItem("inventory");
if (savedInventory) {
  inventory = JSON.parse(savedInventory);
} else {
  // First-time player, initialize with default values
  inventory = {
    potion: 3,
    superPotion: 1,
    pokeball: 5,
  };
  saveInventory(); // 💾 Save immediately
}

const tileset = new Image();
tileset.src = "assets/tiles.png";

const playerSprite = new Image();
playerSprite.src = "assets/player.png";

window.onload = function () {
  if (team.length === 0) {
    showStarterSelection();
  }
  updateInventoryDisplay();
};

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const tile = map[y][x];
      ctx.drawImage(
        tileset,
        tile * 32,
        0,
        32,
        32,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
      );
    }
  }
  ctx.drawImage(
    playerSprite,
    player.x * tileSize,
    player.y * tileSize,
    tileSize,
    tileSize
  );
}

function movePlayer(dx, dy) {
  if (isModalOpen || battle.inBattle) return; // ⛔ Block movement during modal or battle

  const newX = player.x + dx;
  const newY = player.y + dy;
  if (map[newY][newX] !== 1) {
    player.x = newX;
    player.y = newY;
    drawMap();
    updateStatsDisplay();
    savePlayerData(); // ✅ Save new position

    if (map[newY][newX] === 2 && Math.random() < 0.2) {
      chooseActivePokemon();
    }
  }
}

function startBattle() {
  document.body.classList.add("battle-flash");
  setTimeout(() => {
    document.body.classList.remove("battle-flash");
  }, 1000);

  battle.activePokemonIndex = 0;

  document
    .querySelectorAll("#attackButtons button, button[onclick='tryCatch()']")
    .forEach((btn) => (btn.disabled = false));

  const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  battle = {
    playerHP: player.currentHP,
    enemyHP: randomEnemy.maxHP,
    inBattle: true,
    enemy: randomEnemy,
  };

  document.getElementById("enemyName").textContent = randomEnemy.name;
  document.getElementById(
    "enemyType"
  ).textContent = `Type: ${randomEnemy.type}`;
  document.getElementById("enemySprite").src = randomEnemy.sprite;
  document.getElementById("playerBattleHP").textContent = battle.playerHP;
  document.getElementById("enemyHP").textContent = battle.enemyHP;

  updateHPBars();
  document.getElementById(
    "battleLog"
  ).textContent = `A wild ${randomEnemy.name} appeared!`;
  document.getElementById("battleScreen").style.display = "block";
  updateAttackButtons();
}

function startBattleWith(activePokemon) {
  document.body.classList.add("battle-flash");
  setTimeout(() => {
    document.body.classList.remove("battle-flash");
  }, 1000);

  document
    .querySelectorAll("#attackButtons button, button[onclick='tryCatch()']")
    .forEach((btn) => (btn.disabled = false));

  const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  battle = {
    playerHP: activePokemon.currentHP,
    enemyHP: randomEnemy.maxHP,
    inBattle: true,
    enemy: randomEnemy,
    activePokemonIndex: team.indexOf(activePokemon), // Track active Pokémon
  };

  document.getElementById("enemyName").textContent = randomEnemy.name;
  document.getElementById(
    "enemyType"
  ).textContent = `Type: ${randomEnemy.type}`;
  document.getElementById("enemySprite").src = randomEnemy.sprite;
  document.getElementById("playerBattleHP").textContent = battle.playerHP;
  document.getElementById("enemyHP").textContent = battle.enemyHP;

  updateHPBars();
  document.getElementById(
    "battleLog"
  ).textContent = `A wild ${randomEnemy.name} appeared!`;
  document.getElementById("battleScreen").style.display = "block";
  updateAttackButtons();
}

function playerAttack(attackName) {
  if (!battle.inBattle) return;

  const attack = attacks[attackName];
  const playerDamage =
    Math.floor(Math.random() * (attack.max - attack.min + 1)) + attack.min;
  const effectiveness =
    typeEffectiveness[attack.type]?.[battle.enemy.type] || 1;
  const totalDamage = Math.floor(playerDamage * effectiveness);
  const enemyDamage = Math.floor(Math.random() * 10) + 5;

  battle.enemyHP -= totalDamage;
  const activePokemon = team[battle.activePokemonIndex];
  activePokemon.currentHP -= enemyDamage;
  activePokemon.currentHP = Math.max(activePokemon.currentHP, 0);
  battle.playerHP = activePokemon.currentHP;

  battle.enemyHP = Math.max(battle.enemyHP, 0);
  battle.playerHP = Math.max(battle.playerHP, 0);

  document.getElementById("playerBattleHP").textContent = battle.playerHP;
  document.getElementById("enemyHP").textContent = battle.enemyHP;
  updateHPBars();

  let log = `${attackName} did ${totalDamage} damage`;

  if (effectiveness > 1) log += " (Super effective!)";
  if (effectiveness < 1) log += " (Not very effective)";
  log += `! Enemy hits back for ${enemyDamage}.`;

  if (battle.enemyHP === 0) {
    const xpGained = Math.floor(Math.random() * 20) + 10;
    activePokemon.currentXP += xpGained;

    let levelUpMsg = "";

    const xpToNextLevel = activePokemon.level * 50;
    if (activePokemon.currentXP >= xpToNextLevel) {
      activePokemon.level++;
      activePokemon.maxHP += 10;
      activePokemon.currentHP = activePokemon.maxHP;
      activePokemon.currentXP = 0;

      levelUpMsg = ` 🎉 ${activePokemon.name} leveled up to Lv. ${activePokemon.level}! Max HP is now ${activePokemon.maxHP}.`;
      saveTeamData();
    } else {
      player.currentHP = battle.playerHP;
    }

    log += ` 🎉 You won and gained ${xpGained} XP!${levelUpMsg}`;
    endBattle();
  } else if (battle.playerHP === 0) {
    log += " 💀 You lost!";
    player.currentHP = 0;
    endBattle();
  }

  document.getElementById("battleLog").textContent = log;
}

function endBattle() {
  battle.inBattle = false;
  setTimeout(() => {
    document.getElementById("battleScreen").style.display = "none";
    updateStatsDisplay();
    drawMap();
  }, 2000);
  saveTeamData();
}

function updateStatsDisplay() {
  document.getElementById("playerLevel").textContent = player.level;
  document.getElementById("playerXP").textContent = player.xp;
  document.getElementById("playerHPDisplay").textContent = player.currentHP;
}

function updateHPBars() {
  const active = team[battle.activePokemonIndex];
  document.getElementById("playerHPBar").style.width =
    (battle.playerHP / active.maxHP) * 100 + "%";

  document.getElementById("enemyHPBar").style.width =
    (battle.enemyHP / battle.enemy.maxHP) * 100 + "%";
}

function healPlayer() {
  if (battle.inBattle) return alert("You can't heal during battle!");
  player.currentHP = player.maxHP;
  updateStatsDisplay();
  savePlayerData();
  alert("You healed to full HP!");
}

window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowUp") movePlayer(0, -1);
  else if (e.key === "ArrowDown") movePlayer(0, 1);
  else if (e.key === "ArrowLeft") movePlayer(-1, 0);
  else if (e.key === "ArrowRight") movePlayer(1, 0);
});

function tryCatch() {
  if (!battle.inBattle) return;

  const hpRatio = battle.enemyHP / battle.enemy.maxHP;
  const catchChance = Math.random();

  if (inventory.pokeball > 0) {
    inventory.pokeball--;
    saveInventory();
    updateInventoryDisplay?.();
  } else {
    alert("You're out of Pokéballs!");
    return;
  }

  // Higher HP = lower chance; Lower HP = higher chance
  let success = false;
  if (hpRatio < 0.2 && catchChance < 0.9) success = true;
  else if (hpRatio < 0.5 && catchChance < 0.5) success = true;
  else if (catchChance < 0.2) success = true;

  if (success) {
    savePlayerData();

    battle.inBattle = false;

    // ✅ Add the caught Pokémon to the team
    team.push({
      ...battle.enemy,
      level: 1,
      currentXP: 0,
      currentHP: battle.enemy.maxHP,
    });
    localStorage.setItem("myTeam", JSON.stringify(team));

    document.getElementById(
      "battleLog"
    ).textContent = `🎉 You caught ${battle.enemy.name}!`;

    // Disable buttons
    document
      .querySelectorAll("#attackButtons button, button[onclick='tryCatch()']")
      .forEach((btn) => (btn.disabled = true));

    setTimeout(() => {
      alert(`${battle.enemy.name} added to your team!`);
      document.getElementById("battleScreen").style.display = "none";
      drawMap();
    }, 2000);
  } else {
    document.getElementById(
      "battleLog"
    ).textContent = `😢 ${battle.enemy.name} broke free!`;
  }
}

function showTeam() {
  const list = document.getElementById("teamList");
  list.innerHTML = "";

  if (team.length === 0) {
    list.innerHTML = "<li>No Pokémon caught yet!</li>";
  } else {
    team.forEach((member, index) => {
      const li = document.createElement("li");
      li.classList.add("bg-gray-100", "p-4", "rounded");
      li.innerHTML = `
          <strong>#${index + 1} - ${member.name}</strong> (Lv. ${
        member.level
      })<br>
          Type: ${member.type}<br>
          HP: ${member.currentHP}/${member.maxHP}
          <br>
          ${
            inventory.potion > 0
              ? `<button onclick="useItem('potion', ${index})">Use Potion (${inventory.potion})</button>`
              : ""
          }
          ${
            inventory.superPotion > 0
              ? `<button onclick="useItem('superPotion', ${index})">Use Super Potion (${inventory.superPotion})</button>`
              : ""
          }
        `;
      list.appendChild(li);
    });
  }

  document.getElementById("teamModal").style.display = "block";
}

function clearTeam() {
  if (confirm("Are you sure you want to reset your team?")) {
    localStorage.removeItem("myTeam");
    team.length = 0;
    showTeam(); // Update UI
    showToast("Your team has been reset!");

    // ✅ Prompt starter selection again
    setTimeout(() => {
      showStarterSelection();
    }, 500); // Delay slightly for UX
  }
}

function savePlayerData() {
  localStorage.setItem("playerData", JSON.stringify(player));
}

function saveTeamData() {
  localStorage.setItem("myTeam", JSON.stringify(team));
}

function resetPlayer() {
  if (confirm("Reset your player progress?")) {
    document.getElementById("resetOverlay").style.display = "flex";

    setTimeout(() => {
      // 🔄 Remove saved data
      localStorage.removeItem("playerData");
      localStorage.removeItem("myTeam");

      // 🧍 Reset player stats and position
      player.level = 1;
      player.xp = 0;
      player.maxHP = 100;
      player.currentHP = 100;
      player.x = 1;
      player.y = 1;

      // 🎒 Reset inventory
      inventory = {
        potion: 3,
        superPotion: 1,
        pokeball: 5,
      };
      saveInventory();

      // 🧬 Clear team
      team.length = 0;

      // 💾 Save fresh player data
      savePlayerData();

      // 🔁 Update UI
      updateStatsDisplay();
      updateInventoryDisplay();
      drawMap();

      setTimeout(() => {
        document.getElementById("resetOverlay").style.display = "none";
        alert("Player progress reset!");
        showToast("You received 3 Potions, 1 Super Potion, and 5 Pokéballs!");
        showStarterSelection();
      }, 800);
    }, 500); // Simulate a short reset transition
  }
}

function showStarterSelection() {
  const container = document.getElementById("starterChoices");
  container.innerHTML = "";

  starterOptions.forEach((starter) => {
    const btn = document.createElement("button");
    btn.innerHTML = `
        <div>
          <img src="${starter.sprite}" width="64" height="64"><br>
          <strong>${starter.name}</strong> (${starter.type})<br>
          HP: ${starter.maxHP}
        </div>
      `;
    btn.onclick = () => selectStarter(starter);
    btn.style.margin = "10px";
    container.appendChild(btn);
  });

  document.getElementById("starterScreen").style.display = "block";
}

function selectStarter(pokemon) {
  const starter = {
    ...pokemon,
    currentHP: pokemon.maxHP,
    currentXP: 0,
    level: 1,
  };

  team.push(starter);
  localStorage.setItem("myTeam", JSON.stringify(team));
  alert(`${starter.name} has joined your team!`);

  // Heal player and save
  player.currentHP = player.maxHP;
  savePlayerData();

  showToast("You received 3 Potions, 1 Super Potion, and 5 Pokéballs!");

  document.getElementById("starterScreen").style.display = "none";
  drawMap();

  document.getElementById("teamModal").style.display = "none";
  showTeam();
}

function updateAttackButtons() {
  const attackContainer = document.getElementById("attackButtons");
  attackContainer.innerHTML = "";

  const activePokemon = team[battle.activePokemonIndex];

  const moves = activePokemon?.moves || ["Tackle"]; // fallback

  moves.forEach((move) => {
    const btn = document.createElement("button");
    btn.textContent = move;
    btn.onclick = () => playerAttack(move);
    attackContainer.appendChild(btn);
  });

  const catchBtn = document.createElement("button");
  catchBtn.textContent = "🎯 Throw Pokéball";
  catchBtn.onclick = tryCatch;
  attackContainer.appendChild(catchBtn);
}

function chooseActivePokemon() {
  isModalOpen = true;

  const modal = document.createElement("div");
  modal.id = "chooseModal";
  modal.classList.add(
    "fixed",
    "top-1/2",
    "left-1/2",
    "w-full",
    "max-w-[90%]",
    "bg-white",
    "p-4",
    "shadow-lg",
    "rounded-xl",
    "z-30"
  );
  modal.style = "transform:translate(-50%,-50%)";

  team.forEach((mon, i) => {
    const btn = document.createElement("button");
    btn.innerHTML = `${mon.name} (Lv. ${mon.level}) - HP: ${mon.currentHP}/${mon.maxHP}`;
    btn.disabled = mon.currentHP <= 0;
    btn.style.opacity = mon.currentHP <= 0 ? "0.5" : "1";
    btn.onclick = () => {
      document.body.removeChild(modal);
      isModalOpen = false;
      startBattleWith(mon);
    };
    modal.appendChild(btn);
    modal.appendChild(document.createElement("br"));
  });

  document.body.appendChild(modal);
}

function saveInventory() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

function useItem(itemName, index) {
  const healAmount = itemName === "potion" ? 20 : 50;
  const pokemon = team[index];

  if (pokemon.currentHP >= pokemon.maxHP) {
    alert(`${pokemon.name} is already at full HP!`);
    return;
  }

  pokemon.currentHP = Math.min(pokemon.currentHP + healAmount, pokemon.maxHP);
  inventory[itemName]--;
  saveTeamData();
  saveInventory();

  showTeam(); // re-render updated team UI
}

function updateInventoryDisplay() {
  document.getElementById("inventoryDisplay").innerHTML = `
      <strong class="mb-4 block">Inventory:</strong>
      <div class="flex gap-3">
        <div class="flex items-center gap-2 relative w-fit bg-gray-300 p-3 rounded-full">
          <img src="/assets/potion.png" class="w-full max-w-[50px]" />
          <span class="absolute top-0 right-0 bg-red-900 w-6 h-6 flex items-center justify-center rounded-full text-white text-xs">${inventory.potion}</span>
        </div>
        <div class="flex items-center gap-2 relative w-fit bg-gray-300 p-3 rounded-full">
          <img src="/assets/superpotion.png" class="w-full max-w-[50px]" />
          <span class="absolute top-0 right-0 bg-red-900 w-6 h-6 flex items-center justify-center rounded-full text-white text-xs">${inventory.superPotion}</span>
        </div>
      </div>
    `;
}

function openBag() {
  const bag = document.getElementById("bagContent");
  bag.innerHTML = "";

  // === Team Section ===
  const teamHeader = document.createElement("h4");
  teamHeader.textContent = "🧬 Your Pokémon";
  bag.appendChild(teamHeader);

  let hasUsableItems = false;

  team.forEach((mon, index) => {
    const monDiv = document.createElement("div");
    monDiv.style.marginBottom = "10px";

    const monHeader = document.createElement("strong");
    monHeader.textContent = `${mon.name} (Lv. ${mon.level}) - HP: ${mon.currentHP}/${mon.maxHP}`;
    monDiv.appendChild(monHeader);
    monDiv.appendChild(document.createElement("br"));

    // Potion Button
    const potionBtn = document.createElement("button");
    potionBtn.textContent = `Use Potion (${inventory.potion})`;
    potionBtn.disabled = inventory.potion <= 0 || mon.currentHP >= mon.maxHP;
    potionBtn.onclick = () => useItemFromBag("potion", index);
    monDiv.appendChild(potionBtn);

    // Super Potion Button
    const superBtn = document.createElement("button");
    superBtn.textContent = `Use Super Potion (${inventory.superPotion})`;
    superBtn.disabled =
      inventory.superPotion <= 0 || mon.currentHP >= mon.maxHP;
    superBtn.onclick = () => useItemFromBag("superPotion", index);
    monDiv.appendChild(superBtn);

    if (!potionBtn.disabled || !superBtn.disabled) hasUsableItems = true;

    monDiv.appendChild(document.createElement("hr"));
    bag.appendChild(monDiv);
  });

  if (!hasUsableItems) {
    const msg = document.createElement("p");
    msg.style.color = "gray";
    msg.textContent = "All Pokémon are fully healed or no potions available.";
    bag.appendChild(msg);
  }

  // === Items Section ===
  const itemHeader = document.createElement("h4");
  itemHeader.textContent = "🎒 Items in Bag";
  bag.appendChild(itemHeader);

  const itemsList = document.createElement("ul");
  itemsList.innerHTML = `
      <li>Potion: ${inventory.potion}</li>
      <li>Super Potion: ${inventory.superPotion}</li>
      <li>Pokéball: ${inventory.pokeball ?? 0} (used in battle only)</li>
    `;
  bag.appendChild(itemsList);

  document.getElementById("bagModal").style.display = "block";
}

function useItemFromBag(itemName, index) {
  const healAmount = itemName === "potion" ? 20 : 50;
  const pokemon = team[index];

  if (pokemon.currentHP >= pokemon.maxHP) {
    alert(`${pokemon.name} is already at full HP!`);
    return;
  }

  pokemon.currentHP = Math.min(pokemon.currentHP + healAmount, pokemon.maxHP);
  inventory[itemName]--;
  saveTeamData();
  saveInventory();
  openBag(); // Refresh view
  updateInventoryDisplay?.(); // If you show inventory summary elsewhere
}

function closeBag() {
  document.getElementById("bagModal").style.display = "none";
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

tileset.onload = drawMap;
playerSprite.onload = drawMap;
