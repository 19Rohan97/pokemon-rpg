# Pokemon RPG

A browser-based Pokemon RPG game where you can catch and train Pokemon, battle wild enemies, and explore a tile-based world.

![Pokemon RPG](assets/logo.png)

## Features

- **Starter Pokemon Selection**: Choose from Charmander, Squirtle, or Bulbasaur to begin your journey
- **Exploration**: Navigate through a tile-based world using arrow keys or on-screen controls
- **Battle System**: Encounter and battle wild Pokemon in the tall grass
- **Type Effectiveness**: Battle mechanics include type advantages (Fire, Water, Grass, etc.)
- **Pokemon Catching**: Use Pokeballs to catch wild Pokemon and add them to your team
- **Team Management**: View and manage your Pokemon team
- **Inventory System**: Collect and use items like Potions, Super Potions, and Pokeballs
- **Level Up System**: Gain XP from battles and level up your Pokemon
- **Game Saving**: Progress automatically saved to local storage

## How to Play

1. **Starting the Game**: When you first load the game, you'll be prompted to choose a starter Pokemon
2. **Moving**: Use arrow keys on desktop or the on-screen D-pad on mobile to move your character
3. **Encounters**: Walking in tall grass (green tiles) has a chance to trigger random Pokemon encounters
4. **Battles**:
   - Use your Pokemon's moves to attack wild Pokemon
   - Try to catch Pokemon by throwing Pokeballs (lower HP increases catch chance)
   - Win battles to gain XP and level up your Pokemon
5. **Items**:
   - Use Potions to heal your Pokemon (restores 20 HP)
   - Use Super Potions for more healing (restores 50 HP)
   - Collect Pokeballs to catch more Pokemon
6. **Healing**: Click the Pokemon Center icon to fully heal your team
7. **Team Management**: Click "View My Team" to see and manage your caught Pokemon

## Controls

- **Arrow Keys**: Move player (desktop)
- **On-screen D-pad**: Move player (mobile)
- **Bag Button**: Open your inventory
- **View My Team Button**: See your Pokemon team
- **Pokemon Center Button**: Heal all your Pokemon to full HP
- **Restart Button**: Reset game progress (requires confirmation)

## Game Mechanics

### Type Effectiveness

- **Fire** is strong against Grass, weak against Water
- **Water** is strong against Fire, weak against Grass
- **Grass** is strong against Water, weak against Fire
- **Electric** is strong against Flying

### Catching Pokemon

The chance to catch a Pokemon depends on its remaining HP:

- Below 20% HP: 90% catch rate
- Below 50% HP: 50% catch rate
- Above 50% HP: 20% catch rate

### Leveling Up

When a Pokemon gains enough XP (level × 50), it will:

- Increase in level
- Gain +10 max HP
- Fully heal

## Development

This game is built using:

- HTML5 Canvas for rendering
- JavaScript for game logic
- Local Storage for saving game state
- Tailwind CSS for UI styling

## Credits

- Pokemon character sprites and assets are used for educational purposes
- Game developed as a learning project for web-based game development
