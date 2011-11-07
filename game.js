/**
 * Created by JetBrains PhpStorm.
 * User: inpho
 * Date: 10/2/11
 * Time: 5:11 AM
 */

//test

// global variables
var BOARD_ROW_LENGTH = 20;
var BOARD_COL_LENGTH = 20;

// options
var SOUND = false;
var DEBUG = false;

// number of starting enemies
var NUM_OF_ENEMIES = 5;

// zombies container
var zombies = new Array();

// sounds object
var playSound = {
    hitRock  : new Audio("sounds/hitrock.wav"),
    jump     : new Audio("sounds/jump.wav"),
    pushRock : new Audio("sounds/pushrock.wav"),
    hitzombie: new Audio("sounds/hitzombie.wav")
};

// directionals
var NORTH = 1;
var EAST  = 2;
var SOUTH = 3;
var WEST  = 4;

// stores all the cells
var cells;

////////////////////////////

// for key presses
var keys = new Array();
window.addEventListener('keydown', keyDown, true);
//window.addEventListener('keyup', keyUp, true);


// key down functions
function keyDown(e) {

    // enter to jump
    if(e.keyCode == 13)
    {
        player.jump(player.direction);
    }

    // pushing v
    if(e.keyCode == 86)
    {
        player.dropItem("flower");
    }

    // 'w'
    if(e.keyCode == 87)
    {
        player.attack();
    }

    
    // up arrow to move up
	if(e.keyCode == 38)
	{
		player.move(NORTH);

        //for(var x in zombies)
        for(var x=0;x<=zombies.length;x++)
        {
            zombies[x].updateZombies();
        }
    }
    // left arrow to move left
    if(e.keyCode == 37)
    {
        player.move(WEST);

        for(var x=0;x<=zombies.length;x++)
        {
            zombies[x].updateZombies();
        }
    }
    // down arrow to move down
    if(e.keyCode == 40)
    {
        player.move(SOUTH);

        for(var x=0;x<=zombies.length;x++)
        {
            zombies[x].updateZombies();
        }
    }
    // right arrow to move right
    if(e.keyCode == 39)
    {
        player.move(EAST);

        for(var x=0;x<=zombies.length;x++)
        {
            zombies[x].updateZombies();
        }
    }
}


// player class
function Player()
{
    var xloc;
    var yloc;
    var direction;
    var isAlive;
    var hp;
    var maxhp;

    var steps;
    var stonesMoved;
    var flowers;

    var sword;

    // initialize player, set all values to default, place player
    this.init = function()
    {
        // player vitals
        this.maxhp       = 100;
        this.hp          = this.maxhp;
        this.isAlive     = true;
        this.xloc        = 0;
        this.yloc        = 0;
        this.direction   = 1;

        // player stats
        this.steps       = 0;
        this.stonesMoved = 0;

        // player inventory
        this.flowers     = 0;

        // player weapons
        this.sword       = true;

        // place player on map randomly
        this.spawnPlayer();
    };

    // set player on a random spot on the board
    this.spawnPlayer = function()
    {
         // randomly get a x and y location
         this.xloc = Math.floor(Math.random() * BOARD_ROW_LENGTH);
         this.yloc = Math.floor(Math.random() * BOARD_ROW_LENGTH);

         // grab that cell
         var cell = getCell(this.xloc, this.yloc);

         // change class of cell to player
         cell[0].className = this.setPlayerDirectionImage(this.direction);
    };

    // updates players current location
    this.updatePlayerLocation = function(x, y, direction)
    {
        if(direction == NORTH)
        {
            this.yloc--;
        }
        if(direction == EAST)
        {
            this.xloc++;
        }
        if(direction == SOUTH)
        {
            this.yloc++;
        }
        if(direction == WEST)
        {
            this.xloc--;
        }
    };

    // updates players facing direction
    this.updatePlayerDirection = function(x)
    {
        player.direction = x;
    };

    // increments players total steps
    this.updatePlayerSteps = function()
    {
        player.steps++;
    };

    // increments an item
    this.incrementItem = function(item)
    {
        if(item == "flower")
        {
            player.flowers++;
        }
        if(item == "rock")
        {
            player.stonesMoved++;
        }
    };

    // decrement an item
    this.decrementItem = function(item)
    {
        if(item == "flower")
        {
            player.flowers--;
        }             
    };

    this.takeDamage = function(amount)
    {
        var damageToTake = amount;

        this.hp -= damageToTake;
        if(this.hp <= 0)
        {
            this.isAlive = false;
        }
    };

    // jumps char
    this.jump = function(direction)
    {
        var x = player.xloc;
        var y = player.yloc;

        if(isCellEmpty(direction, 2))
        {
            // play jump sound
            if(SOUND)
            {
                playSound.jump.play();
            }

            // update current cell with plains tile
            var oldCell = getCell(x, y);
            oldCell[0].className = 'plains';

            // move player in direction twice (simulate jumping)
            this.updatePlayerLocation(x, y, direction);
            this.updatePlayerLocation(x, y, direction);
                        
            // get cell for new current x,y from player after the updatePlayerLocation's
            var cell = getCell(player.xloc, player.yloc);
            cell[0].className = this.setPlayerDirectionImage(direction);
        }
        else
        {
            sendMsg("Cannot jump, something is in your way", "event");
            return;
        }
    };

    // function to check if user is dead
    // returns true if dead
    this.isDead = function()
    {
        if(!this.isAlive)
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    // move player & trigger all other actions
    this.move = function(direction)
    {
        // since move is the only thing being called all the time,
        // check if player is dead from here
        if(this.isDead())
        {
            var dead = document.getElementById("dead");
            dead.style.display = "block";
          
            window.location = "dead.php";
        }

        var x = player.xloc;
        var y = player.yloc;

        // check for wall
        if(checkForWall(x, y, direction, 1))
        {
            // if true return without moving player
            return;
        }

        // check for flower
        if(checkForItem(x, y, direction, "flower", 1))
        {
            this.incrementItem("flower");
        }

        // check for rock
        if(checkForItem(x, y, direction, "rock", 1))
        {
            // push rock
            if(moveRock(x, y, direction))
            {
                this.incrementItem("rock");
            }
            else
            {
                // cant move rock due to obstruction
                if(DEBUG)
                {
                    sendMsg("Can't move rock due to obstruction", "event");
                }
                return;
            }
        }

        // update everything else, needs to be in a different function
        displayStats();
        checkForGrowth();
        isCellEmpty(direction, 2);

        // update players total steps
        this.updatePlayerSteps();
        // update players facing direction
        this.updatePlayerDirection(direction);
        // update players location
        this.updatePlayerLocation(x, y, direction);

        // update current cell with plains tile
        var oldCell = getCell(x, y);
        oldCell[0].className = 'plains';

        // update moving to tile with player
        var cell = getNextCell(x, y, direction);
        cell[0].className = this.setPlayerDirectionImage(direction);

        //clearMsg();

    };


    this.attack = function()
    {
        if(this.sword)
        {
            var x = player.xloc;
            var y = player.yloc;
            var direction = player.direction;

            if(checkForWall(x, y, direction, 1))
            {
                sendMsg("You hit a wall with your sword", "player");
                return;
            }

            // check for flower
            if(checkForItem(x, y, direction, "flower", 1))
            {
                var cell = getNextCell(x, y, direction);
                cell[0].className = "plains";
                sendMsg("You destroyed a flower", "player");
                return;
            }

            // check for rock
            if(checkForItem(x, y, direction, "rock", 1))
            {
                if(SOUND)
                {
                    playSound.hitRock.play();
                }
                
                sendMsg("You hit a rock with your sword", "player");
                return;
            }

            // check for zombie
            if(checkForItem(x, y, direction, "zombie", 1))
            {
                if(direction == NORTH)
                {
                    var zy = y - 1;
                }
                else if(direction == EAST)
                {
                    var zx = x + 1;
                }
                else if(direction == SOUTH)
                {
                    var zy = y + 1;
                }
                else if(direction == WEST)
                {
                    var zx = x - 1;
                }

                for(var zombie=0; zombie<=zombies.length; zombie++)
                {
                    if((zombies[zombie].yloc == zy && zombies[zombie].xloc == x) || (zombies[zombie].xloc == zx && zombies[zombie].yloc == y))
                    {
                        // hit zombie sound
                        if(SOUND)
                        {
                            playSound.hitzombie.play();
                        }

                        // remove zombie from array
                        zombies.splice(zombie, 1);

                        // send msg
                        sendMsg("You killed a zombie.", "event");

                        // replace zombie with plains tile
                        var cell = getNextCell(x, y, direction);
                        cell[0].className = "plains";
                    }
                }

                return;
            }
        }
        else
        {
            sendMsg("You dont have a sword", "event");
        }

    };

    this.dropItem = function(item)
    {
        var x = player.xloc;
        var y = player.yloc;
        var direction = player.direction;

        //check if player has the item
        if(item == "flower")
        {
            if(player.flowers >= 1)
            {
                // check if space is open for item to drop
                // check for wall
                if(checkForWall(x, y, direction, 1))
                {
                    sendMsg("Can't plant a flower, wall in the way", "event");
                    return;
                }

                // check for flower
                if(checkForItem(x, y, direction, "flower", 1))
                {
                    sendMsg("Already a flower there", "event");
                    return;
                }

                // check for rock
                if(checkForItem(x, y, direction, "rock", 1))
                {
                    sendMsg("A rock is in the way", "event");
                    return;
                }

                // drop item
                var cell = getNextCell(x, y, direction);
                cell[0].className = "flower";

                // decrement item
                this.decrementItem("flower");

                // send msg
                sendMsg("You planted a flower", "player");
            }
            else
            {
                // not enough flowers
                sendMsg("You don't have a flower", "player");
                return;
            }
        }


    };

    // draws the players image based on direction
    this.setPlayerDirectionImage = function(direction)
    {
        if(direction == NORTH)
        {
            return "playerNorth";
        }

        if(direction == WEST)
        {
            return "playerWest";
        }

        if(direction == EAST)
        {
            return "playerEast";
        }

        if(direction == SOUTH)
        {
            return "playerSouth";
        }
    };
}

// monster class
function Zombie()
{
    var xloc;
    var yloc;
    var direction;

    // initilize zombie, set all values to default, place zombie
    this.init = function()
    {
        this.direction = 1;

        // place player on map randomly
        this.placeRandomZombie();
    };

    // updates zombie facing direction
    this.updateZombieDirection = function(x)
    {
        this.direction = x;
    };

    // randomly places a zombie
    this.placeRandomZombie = function()
    {
        // randomly get a x and y location
         this.xloc = Math.floor(Math.random() * BOARD_ROW_LENGTH);
         this.yloc = Math.floor(Math.random() * BOARD_ROW_LENGTH);

         // grab that cell
         var cell = getCell(this.xloc, this.yloc);
         cell[0].className = "zombie";
    };

    // updates zombie current location
    this.updateZombieLocation = function(x, y, direction)
    {
        if(direction == NORTH)
        {
            this.yloc--;
        }
        if(direction == EAST)
        {
            this.xloc++;
        }
        if(direction == SOUTH)
        {
            this.yloc++;
        }
        if(direction == WEST)
        {
            this.xloc--;
        }
    };

    // not currently used
    this.updateZombies = function()
    {
        this.changeFacingDirection();
        this.move();

        this.spawnNewZombie();
        //this.clearVisionTiles();
    };

    this.spawnNewZombie = function()
    {
        var chanceToSpawn = .01;
        var roll = Math.random();

        if(roll < chanceToSpawn)
        {
            zombies.push(new Zombie());

            var last = zombies.length-1;
            zombies[last].init();

            sendMsg("A Zombie has spawned!", "event");
        }
    };


    // sees if the facing direction changes
    this.changeFacingDirection = function()
    {
        var chanceToChange = .25;
        var roll = Math.random();

        // if roll is less than chanceToChange
        // move facing direction
        if(roll < chanceToChange)
        {
            // roll for a new direction
            var newDirection = Math.floor(Math.random() * 4);

            // if 0, zombie direction remains the same, dont move
            if(newDirection == 0)
            {
                return 0;
            }

            var currentDirection = this.direction;

            if(newDirection == 1)
            {
                if(DEBUG)
                {
                    sendMsg("zombie " + this + " is changing direction to north", "debug");
                }

                this.updateZombieDirection(NORTH);
                return;
            }
            if(newDirection == 2)
            {
                if(DEBUG)
                {
                    sendMsg("zombie " + this + " is changing direction to east", "debug");
                }

                this.updateZombieDirection(EAST);
                return;
            }
            if(newDirection == 3)
            {
                if(DEBUG)
                {
                    sendMsg("zombie " + this + " is changing direction to south", "debug");
                }

                this.updateZombieDirection(SOUTH);
                return;
            }
            if(newDirection == 4)
            {
                if(DEBUG)
                {
                    sendMsg("zombie " + this + " is changing direction to west", "debug");
                }

                this.updateZombieDirection(WEST);
                return;
            }
        }
    };

    //checks vision for the zombie to see if there is a player
    this.getVision = function()
    {
        var x = this.xloc;
        var y = this.yloc;
        var direction = this.direction;
        
        if(direction == NORTH)
        {
            // [ ][ ][ ][ ][ ]
            // [ ][x][ ][ ][ ]
            // [ ][ ][o][ ][ ]
            var x1 = x-1;
            var y1 = y-1;

            // [ ][ ][ ][ ][ ]
            // [ ][ ][x][ ][ ]
            // [ ][ ][o][ ][ ]
            var y2 = y-1;
            var x2 = x;

            // [ ][ ][ ][ ][ ]
            // [ ][ ][ ][x][ ]
            // [ ][ ][o][ ][ ]
            var y3 = y-1;
            var x3 = x+1;

            // [x][ ][ ][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][o][ ][ ]
            var x4 = x-2;
            var y4 = y-2;

            // [ ][x][ ][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][o][ ][ ]
            var x5 = x-1;
            var y5 = y-2;

            // [ ][ ][x][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][o][ ][ ]
            var y6 = y-2;
            var x6 = x;

            // [ ][ ][ ][x][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][o][ ][ ]
            var x7 = x+1;
            var y7 = y-2;

            // [ ][ ][ ][ ][x]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][o][ ][ ]
            var x8 = x+2;
            var y8 = y-2;
        }

        if(direction == SOUTH)
        {
            // [ ][ ][o][ ][ ]
            // [ ][x][ ][ ][ ]
            // [ ][ ][ ][ ][ ]
            var x1 = x-1;
            var y1 = y+1;

            // [ ][ ][o][ ][ ]
            // [ ][ ][x][ ][ ]
            // [ ][ ][ ][ ][ ]
            var y2 = y+1;
            var x2 = x;

            // [ ][ ][o][ ][ ]
            // [ ][ ][ ][x][ ]
            // [ ][ ][ ][ ][ ]
            var y3 = y+1;
            var x3 = x+1;

            // [ ][ ][o][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [x][ ][ ][ ][ ]
            var x4 = x-2;
            var y4 = y+2;

            // [ ][ ][o][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][x][ ][ ][ ]
            var x5 = x-1;
            var y5 = y+2;

            // [ ][ ][o][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][x][ ][ ]
            var y6 = y+2;
            var x6 = x;

            // [ ][ ][o][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][ ][x][ ]
            var x7 = x+1;
            var y7 = y+2;

            // [ ][ ][o][ ][ ]
            // [ ][ ][ ][ ][ ]
            // [ ][ ][ ][ ][x]
            var x8 = x+2;
            var y8 = y+2;
        }


        if(direction == EAST)
        {
            // [ ][ ][ ]
            // [ ][ ][ ]
            // [o][x][ ]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x1 = x+1;
            var y1 = y;

            // [ ][ ][ ]
            // [ ][x][ ]
            // [o][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x2 = x+1;
            var y2 = y-1;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [o][ ][ ]
            // [ ][x][ ]
            // [ ][ ][ ]
            var x3 = x+1;
            var y3 = y+1;

            // [ ][ ][x]
            // [ ][ ][ ]
            // [o][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x4 = x+2;
            var y4 = y-2;

            // [ ][ ][ ]
            // [ ][ ][x]
            // [o][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x5 = x+2;
            var y5 = y-1;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [o][ ][x]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x6 = x+2;
            var y6 = y;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [o][ ][ ]
            // [ ][ ][x]
            // [ ][ ][ ]
            var x7 = x+2;
            var y7 = y+1;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [o][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][x]
            var x8 = x+2;
            var y8 = y+2;
        }

        if(direction == WEST)
        {
            // [ ][ ][ ]
            // [ ][ ][ ]
            // [ ][x][o]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x1 = x-1;
            var y1 = y;

            // [ ][ ][ ]
            // [ ][x][ ]
            // [ ][ ][o]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x2 = x-1;
            var y2 = y1;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][o]
            // [ ][x][ ]
            // [ ][ ][ ]
            var x3 = x-1;
            var y3 = y+1;

            // [x][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][o]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x4 = x-2;
            var y4 = y-2;

            // [ ][ ][ ]
            // [x][ ][ ]
            // [ ][ ][o]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x5 = x-2;
            var y5 = y-1;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [x][ ][o]
            // [ ][ ][ ]
            // [ ][ ][ ]
            var x6 = x-2;
            var y6 = y;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][o]
            // [x][ ][ ]
            // [ ][ ][ ]
            var x7 = x-2;
            var y7 = y+1;

            // [ ][ ][ ]
            // [ ][ ][ ]
            // [ ][ ][o]
            // [ ][ ][ ]
            // [x][ ][ ]
            var x8 = x-2;
            var y8 = y+2;
        }


        var cell1 = getCell(x1, y1);
        if(cell1[0].className == 'playerNorth' || cell1[0].className == 'playerEast' || cell1[0].className == 'playerSouth' || cell1[0].className == 'playerWest')
        {
           sendMsg("BRAINNZZZZ....", "zombie");
           return true;
        }

        var cell2 = getCell(x2, y2);
        if(cell2[0].className == 'playerNorth' || cell2[0].className == 'playerEast' || cell2[0].className == 'playerSouth' || cell2[0].className == 'playerWest')
        {
           sendMsg("mmm..BRAINZZZ..", "zombie");
           return true;
        }

        var cell3 = getCell(x3, y3);
        if(cell3[0].className == 'playerNorth' || cell3[0].className == 'playerEast' || cell3[0].className == 'playerSouth' || cell3[0].className == 'playerWest')
        {
           sendMsg("hungrreee...", "zombie");
           return true;
        }

        var cell4 = getCell(x4, y4);
        if(cell4[0].className == 'playerNorth' || cell4[0].className == 'playerEast' || cell4[0].className == 'playerSouth' || cell4[0].className == 'playerWest')
        {
           sendMsg("gaahhhh..", "zombie");
           return true;

        }

        var cell5 = getCell(x5, y5);
        if(cell5[0].className == 'playerNorth' || cell5[0].className == 'playerEast' || cell5[0].className == 'playerSouth' || cell5[0].className == 'playerWest')
        {
           sendMsg("*chomp chomp*..", "zombie");
           return true;
        }

        var cell6 = getCell(x6, y6);
        if(cell6[0].className == 'playerNorth' || cell6[0].className == 'playerEast' || cell6[0].className == 'playerSouth' || cell6[0].className == 'playerWest')
        {
           sendMsg("....", "zombie");
           return true;
        }

        var cell7 = getCell(x7, y7);
        if(cell7[0].className == 'playerNorth' || cell7[0].className == 'playerEast' || cell7[0].className == 'playerSouth' || cell7[0].className == 'playerWest')
        {
           sendMsg("BRAINszz.", "zombie");
           return true;
        }

        var cell8 = getCell(x8, y8);
        if(cell8[0].className == 'playerNorth' || cell8[0].className == 'playerEast' || cell8[0].className == 'playerSouth' || cell8[0].className == 'playerWest')
        {
           sendMsg("HUMANSS", "zombie");
           return true;
        }

   
    };

    /*
    // static function to randomly place rock
    this.clearVisionTiles = function()
    {
        for(var y=0;y<BOARD_ROW_LENGTH;y++)
        {
            for(var x=0;x<BOARD_COL_LENGTH;x++)
            {
                var cell = getCell(x, y);
                //console.log(cell[0]);

                if(cell[0].className == "target")
                {
                   cell[0].style.display = none;
                }
            }
        }
    };
    */

    // changes teh zombies facing direction by flipping north = south
    this.flipDirection = function()
    {
        var dir = this.direction;

        if(dir == NORTH)
        {
            this.direction = SOUTH;
        }
        if(dir == EAST)
        {
            this.direction = WEST;
        }
        if(dir == SOUTH)
        {
            this.direction = NORTH;
        }
        if(dir == WEST)
        {
            this.direction = EAST;
        }
    };

    // handles the zombie movements
    this.move = function()
    {
        var chanceToMove  = .20;
        var ran = Math.random();
        
        // roll to see if moves
        if(ran < chanceToMove)
        {
            var x = this.xloc;
            var y = this.yloc;
            var direction = this.direction;

            // check for wall
            if(checkForWall(x, y, direction, 1))
            {
                sendMsg("zombie " + this + " ran into a wall, flipping directions", "debug");
                this.flipDirection();
                return;
            }

            // check for rock
            if(checkForItem(x, y, direction, "rock", 1))
            {
                if(moveRock(x, y, direction))
                {
                    //push rock
                    sendMsg("zombie " + this + " pushes a rock!!", "debug");
                }
                else
                {
                    // cant move due to obsruction, wall/rock
                }
            }

            if(checkForItem(x, y, direction, "zombie", 1))
            {
                //sendZombieMsg("Err.. zombies bump");
                this.flipDirection();
                return;
            }
            

            //sendZombieMsg("moving" + direction);
            this.updateZombieLocation(x, y, direction);
            
            // update current cell with plains tile
            var oldCell = getCell(x, y);
            oldCell[0].className = 'plains';

            // update moving to tile with player
            var cell = getNextCell(x, y, direction);
            cell[0].className = "zombie";
        }
    };
}

// terrain class
function Terrain()
{
    // 50 percent chance of a grass tile
    var chanceOfGrass = .50;

    // 15 percent chance of a rock tile
    var chanceOfRock = .90;

    // 2 percent change of flower
    var chanceOfFlower = .98;

    // static function to randomly place rock
    this.placeRandomStone = function()
    {
        for(var y=0;y<BOARD_ROW_LENGTH;y++)
        {
            for(var x=0;x<BOARD_COL_LENGTH;x++)
            {
                var cell = getCell(x, y);
                if(Math.random() > chanceOfRock)
                {
                    cell[0].className = "rock";
                }
            }
        }
    };

    // function to randomly place grass
    this.placeRandomGrass = function()
    {
        for(var y=0;y<BOARD_ROW_LENGTH;y++)
        {
            for(var x=0;x<BOARD_COL_LENGTH;x++)
            {
                var cell = getCell(x, y);
                if(Math.random() > chanceOfGrass)
                {
                    cell[0].className = "grass";
                }
            }
        }
    };

    // random chance of new growth each move
    this.checkForGrowth = function()
    {
        var ran = Math.random();
        if(ran > chanceOfFlower)
        {
            this.growItem("flower");
            return;
        }
        if(ran > chanceOfGrass)
        {
            this.growItem("grass");
            return;
        }
    };

    // pass an item and it will randomly spawn it on the map
    this.growItem = function(item)
    {
        var x = Math.floor(Math.random() * BOARD_ROW_LENGTH + 1);
        var y = Math.floor(Math.random() * BOARD_ROW_LENGTH + 1);
        var cell = getCell(x, y);

        if(cell[0].className === "player")
        {
            this.growItem(item);
        }
        else if(cell[0].className === "rock")
        {
            this.growItem(item);
        }
        else
        {
            if(item == "flower")
            {
                cell[0].className = "flower";
            }
            if(item == "grass")
            {
                cell[0].className = "grass";
            }
        }
    };
    
}

// Init global objects
var player  = new Player();
var terrain = new Terrain();


function initBoard(BOARD_ROW_LENGTH, BOARD_COL_LENGTH)
{
    var trHtml = [];

    for(var y=0;y<BOARD_COL_LENGTH;y++)
    {
        trHtml.push('<tr>');

        for(var x=0;x<BOARD_ROW_LENGTH;x++)
        {
            trHtml.push('<td class="plains">&nbsp;</td>');
        }

        trHtml.push('</tr>');
    }

    trHtml = trHtml.join('');
    table.innerHTML = trHtml;
}

function displayStats()
{
    //var main = document.getElementById("stats");
    var hp = document.getElementById("hp");
    var maxhp = document.getElementById("maxhp");

    hp.innerHTML = player.hp;
    maxhp.innerHTML = player.maxhp;
    
    var flower = document.getElementById("flowers");
    flower.innerHTML = player.flowers;

    var steps = document.getElementById("steps");
    steps.innerHTML = player.steps;

    var stonesMoved = document.getElementById("stonesMoved");
    stonesMoved.innerHTML = player.stonesMoved;

}

// a hack to call my other objects methods.....
function checkForGrowth()
{
    terrain.checkForGrowth();
}

// modifys the x or y depending on the direction and distance
function modifyXY(xy, direction, distance)
{

    if(direction == 1 || direction == 4)
    {
        xy = xy - distance;
    }
    if(direction == 2 || direction == 3 )
    {
        xy = xy + distance;
    }
    
    return xy;
}

// check if a certain item exists, returns boolean
function checkForItem(x, y, direction, item, distance)
{
    var itemExist = false;

    // adjusts the x, y depending on direction/distance
    if(direction == 1 || direction == 3)
    {
        y = modifyXY(y, direction, distance);

    }
    if(direction == 2 || direction == 4)
    {
        x = modifyXY(x, direction, distance);
    }

    var cell = getCell(x, y);
    if(cell[0].className == item)
    {
        itemExist = true;
    }

    return itemExist;
}

// checks if a wall exists in the x, y + direction; distance is how many spaces away
function checkForWall(x, y, direction, distance)
{
    // adjusts the x, y depending on direction/distance
    if(direction == 1 || direction == 3)
    {
        y = modifyXY(y, direction, distance);

    }
    if(direction == 2 || direction == 4)
    {
        x = modifyXY(x, direction, distance);
    }
    
    var wall = false;

    if(x >= BOARD_ROW_LENGTH) { wall = true; }
    if(y >= BOARD_ROW_LENGTH) { wall = true; }
    if(x <= -1) { wall = true; }
    if(y <= -1) { wall = true; }

    return wall;
}

// checks if a wall exists in the x, y + direction; distance is how many spaces away
function isWall(x, y)
{
    var wall = false;

    if(x >= BOARD_ROW_LENGTH) { wall = true; }
    if(y >= BOARD_ROW_LENGTH) { wall = true; }
    if(x <= -1) { wall = true; }
    if(y <= -1) { wall = true; }

    return wall;
}

// who can be = "zombie" or "player" or "event"
// displays a message in the msg div tll next move
function sendMsg(message, who)
{
    // setup message to have the correct font color based on who was passed
    if(who === "zombie")
    {
        message = "z " + message;
    }
    if(who === "player")
    {
        message = "p " + message;
    }
    if(who === "event")
    {
        message = "e " + message;
    }
    if(who === "debug")
    {
        message = "**" + message;
    }

    // used to display messages to the user
    var msg = document.getElementById("textLog");
    
    // makes the textarea auto scroll with content
    msg.scrollTop = msg.scrollHeight - msg.clientHeight;
     
    msg.innerHTML += message + "\n";
}

function turnSound()
{
    if(SOUND)
    {
        SOUND = false;
        sendMsg("Sound Disabled", "event");
    }
    else
    {
        SOUND = true;
        sendMsg("Sound Enabled", "event");
    }
}

function turnDebug()
{
    if(DEBUG)
    {
        DEBUG = false;
        sendMsg("Debug Disabled", "event");
    }
    else
    {
        DEBUG = true;
        sendMsg("Debug Enabled", "event");
    }

}

// checks if the cell is empty
function isCellEmpty(direction, distance)
{
    if(DEBUG)
    {
        sendMsg("Moving direction :" + direction, "debug");
    }

    if(direction == NORTH)
    {
        y = modifyXY(player.yloc, direction, distance);
        x = player.xloc;
    }
    if(direction == EAST)
    {
        x = modifyXY(player.xloc, direction, distance);
        y = player.yloc;
    }
    if(direction == SOUTH)
    {
        y = modifyXY(player.yloc, direction, distance);
        x = player.xloc;
    }
    if(direction == WEST)
    {
        x = modifyXY(player.xloc, direction, distance);
        y = player.yloc;
    }

    var cell = getCell(x, y);
    var empty = true;

    if(isWall(x, y))
    {
        sendMsg("Space not empty, wall there", "event");
        empty = false;
        return empty;
    }
   
    if(cell[0].className == "player")
    {
        //cell[0].className = "red";
        empty = false;
        return empty;
    }
    if(cell[0].className == "rock")
    {
        sendMsg("Space not empty, rock there", "event");
        //cell[0].className = "target";
        empty = false;
        return empty;
    }
    if(cell[0].className == "flower")
    {
        sendMsg("Space not empty, flower there", "event");
        //cell[0].className = "target";
        empty = false;
        return empty;
    }

    //sendMsg("SPACE EMPTY");
    return empty;
}

// if walking into a rock it will move it in the direction
function moveRock(x, y, direction)
{
    var move = true;

    // adjusts the x, y depending on direction + distance
    if(direction == 1 || direction == 3)
    {
        y = modifyXY(y, direction, 1);

    }
    if(direction == 2 || direction == 4)
    {
        x = modifyXY(x, direction, 1);
    }

    // check to see if rock will hit wall
    if(checkForWall(x, y, direction, 1))
    {
        sendMsg("Hitting a wall", "event");
        move = false;
        return move;
    }
    // check to see if another rock is in the way of pushing
    if(checkForItem(x, y, direction, "rock", 1))
    {
        sendMsg("Something in the way", "event");
        move = false;
        return move;
    }
    else
    {
        // play pushrock sound
        if(SOUND)
        {
            playSound.pushRock.play();
        }

        var oldRockCell = getCell(x, y);
        oldRockCell[0].className = "trail";

        var newRockCell = getNextCell(x, y, direction);
        newRockCell[0].className = "rock";

        return move;
    }
}

// get cell usign the x, y
// returns cell
function getCell(x, y)
{
    if(x >= BOARD_ROW_LENGTH) { x = 0; }
    if(y >= BOARD_COL_LENGTH) { y = 0; }
    if(x < 0) { x = BOARD_ROW_LENGTH -1; }
    if(y < 0) { y = BOARD_COL_LENGTH -1; }

    return $(cells[y * BOARD_COL_LENGTH + x]);
}

// uses the current x and y, but then takes the direction and adjusts the x, y approriately
// returns that cell
function getNextCell(x, y, direction)
{
    var cell;

    if(direction == NORTH)
    {
        cell = getCell(x, y-1);
        return cell;
    }
    if(direction == EAST)
    {
        cell = getCell(x+1, y);
        return cell;
    }
    if(direction == SOUTH)
    {
        cell = getCell(x, y+1);
        return cell;
    }
    if(direction == WEST)
    {
        cell = getCell(x-1, y);
        return cell;
    }
}


$(document).ready(function() {

   // get table object
   table = document.getElementById("main");

   // generates the board
   initBoard(BOARD_ROW_LENGTH, BOARD_COL_LENGTH);

   // store all table td's into cells array
   cells = $(table).find('td');

   // place grass and stones
   terrain.placeRandomGrass();
   terrain.placeRandomStone();

   // generate and place zombies
   for (x = 0; x <= NUM_OF_ENEMIES; x++)
   {
        zombies[x] = new Zombie();
        zombies[x].init();
   }

   //zombie.init();
   //zombie1.init();

   // initialize player
   player.init();

});





