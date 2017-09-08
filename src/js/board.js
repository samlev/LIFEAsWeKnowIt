var board = [];

// Configure All the things!
// Maximum board size
const MAX_Y = 80; // Number of rows
const MAX_X = 150; // Number of columns
const TICK_TIME = 500; // the number of milliseconds between ticks.

// Breeding
const MIN_BREED_AGE = 16; // Cells must be at least this old to breed
const MAX_BREED_AGE = 60; // Cells older than this age cannot breed
const REQUIRED_PARENTS = 2; // The number of eligible neighbouring cells required for breeding
const REDUCED_FERTILITY_AGE = 35; // From here, cells start losing fertility
const REDUCED_FERTILITY_PER_YEAR_MULTIPLIER = 0.05; // The amount (per year over REDUCED_FERTILITY_AGE) that fertility reduces

// Death
const ADULT_MORTALITY_CHANCE = 0.05; // The chance that a regular adult cell will die.
const CHILD_MORTALITY_CUTOFF = 6; // Cells under this age are more likely to die
const CHILD_MORTALITY_MULTIPLIER = 0.1; // The amount (per year under CHILD_MORTALITY_CUTOFF) that mortality increases
const ELDERLY_MORTALITY_CUTOFF = 65; // Cells over this age are increasingly more likely to die
const ELDERLY_MORTALITY_MULTIPLIER = 0.05; // The amount (per year over ELDERLY_MORTALITY_CUTOFF) that fertility reduces
const LONELINESS_MINIMUM = 2; // The number of neighbours required to not be 'lonely'
const CROWDED_MAXIMUM = 4; // The number of neighbours to make a cell official "crowded"
const LONLINESS_MORTALITY_MULTIPLIER = 0.5; // Child or Elderly cells get an increased chance of dying from being lonely (added per neighbour under the LONELINESS_MINIMUM)
const CROWDED_MORTALITY_MULTIPIER = 0.2; // Adult cells have an increased chance of dying from being overcrowded. (added per neighbour over the CROWDED_MAXIMUM)

// Start by building the board.
for (var y = 0; y < MAX_Y; y++) {
    for (var x = 0; x < MAX_X; x++) {
        if (x === 0) {
            board[y] = [];
        }

        var age = parseInt((Math.random() * ELDERLY_MORTALITY_CUTOFF));

        // artificially kill 2/3 of the population
        age = ((age % 3) <= 1 ? 0 : age);
        board[y][x] = {'age': age};
    }
}

new Vue({
    el: '#board',
    data: {
        rows: board,
        play: false
    },
    methods: {
        calcAgeClass: function(age) {
            // Group loosely into 10-year groups, but older than 100 is just... older than 100
            return (
                age >= 100 ?
                    'age-100' :
                    "age-" + Math.ceil(age/10)
            );
        },
        step: function () {
            // by default, stop as soon as we step
            this.stop();
            tick();
        },
        start: function () {
            // turn 'auto play' on
            this.play = true;
            var self = this;

            // make a function which ticks, then tells itself to play again in TICK_TIME, unless 'auto play' is turned off.
            var playFunc = function () {
                if (self.play) {
                    tick();

                    setTimeout(playFunc, TICK_TIME);
                }
            };

            playFunc();
        },
        stop: function () {
            this.play = false;
        }
    }
});

/**
 * Simplifies the board to a 2-dimensional object of just the living cells.
 *
 * @return Object
 */
function simpleBoard() {
    var b = {};

    for (var y = 0; y < MAX_Y; y++) {
        for (var x = 0; x < MAX_X; x++) {
            if (board[y][x].age !== 0) {
                if (b[y] === undefined) {
                    b[y] = {};
                }
                b[y][x] = board[y][x].age;
            }
        }
    }

    return b;
}

/**
 * Return an array of the ages of all living neighbours
 *
 * @param y The 'y' (row) coordinate
 * @param x The 'x' (column) coordinate
 * @param b A cut-down representation of the board
 * @return Array
 */
function getNeighbours(y, x, b) {
    // Get the 'before' (b) and 'after' (a) coordinates for potential neighbours
    var x_b = (x === 0 ? MAX_X : x - 1);
    var x_a = (x === (MAX_X - 1)? 0 : x + 1);
    var y_b = (y === 0 ? MAX_Y : y - 1);
    var y_a = (y === (MAX_Y - 1)? 0 : y + 1);

    var neighbours = [];

    // Check the row before ours
    if (b[y_b] !== undefined) {
        if (b[y_b][x_b] !== undefined) {
            neighbours.push(b[y_b][x_b]);
        }
        if (b[y_b][x] !== undefined) {
            neighbours.push(b[y_b][x]);
        }
        if (b[y_b][x_a] !== undefined) {
            neighbours.push(b[y_b][x_a]);
        }
    }

    // Check the row we're in
    if (b[y] !== undefined) {
        if (b[y][x_b] !== undefined) {
            neighbours.push(b[y][x_b]);
        }
        // Don't check [y][x] - that's us
        if (b[y][x_a] !== undefined) {
            neighbours.push(b[y][x_a]);
        }
    }

    // Check the row after ours
    if (b[y_a] !== undefined) {
        if (b[y_a][x_b] !== undefined) {
            neighbours.push(b[y_a][x_b]);
        }
        if (b[y_a][x] !== undefined) {
            neighbours.push(b[y_a][x]);
        }
        if (b[y_a][x_a] !== undefined) {
            neighbours.push(b[y_a][x_a]);
        }
    }

    return neighbours
}

/**
 * Return a new life value for a potential breeder cell
 *
 * @param y The 'y' (row) coordinate
 * @param x The 'x' (column) coordinate
 * @param b A cut-down representation of the board
 * @return int
 */
function breed(y, x, b) {
    // breeding is dependant on potential parents
    var n = getNeighbours(y, x, b);

    // Check if the neighbours are too young or too old to be parents
    var ineligible = [];
    for (var p in n) {
        if (n[p] <= MIN_BREED_AGE || n[p] >= MAX_BREED_AGE) {
            ineligible.push(p);
        }
    }

    // Remove the ineligible neighbours, last first.
    while (ineligible.length > 0) {
        n.splice(ineligible.pop(), 1);
    }

    // Need the required number of neighbours to breed
    if (n.length < REQUIRED_PARENTS) {
        return 0;
    }

    // We can potentially breed! Let's find out the probability that it'll actually happen. This society is weird - all neighbours that can breed pool in together.
    var chance = 0;
    for (var p in n) {
        // If we're old enough that we start reducing fertility, the chance of breeding will get worse every year
        if (n[p] > REDUCED_FERTILITY_AGE) {
            chance += (100 - Math.ceil((n[p] - REDUCED_FERTILITY_AGE) * REDUCED_FERTILITY_PER_YEAR_MULTIPLIER));
        } else {
            // we're in the breeding zone - 100% chance of breeding
            chance += 100;
        }
    }

    // get the actual average percentage of breeding
    chance = Math.floor(chance / n.length);

    // If a random number from 1-100 is less than the chance of breeding, then we breed! Otherwise, better luck next time.
    return (Math.ceil(Math.random() * 100) <= chance ? 1 : 0);
}

/**
 * Return if a cell dies or not
 *
 * @param y The 'y' (row) coordinate
 * @param x The 'x' (column) coordinate
 * @param b A cut-down representation of the board
 * @return boolean
 */
function die(y, x, b) {
    // get the age of the current cell
    var age = b[y][x];
    var n = getNeighbours(y, x, b);

    // Start with regular adult mortality
    var mortality = ADULT_MORTALITY_CHANCE;

    // Find special modifier conditions for children or elderly
    if (age < CHILD_MORTALITY_CUTOFF) {
        // first - just multiplier for being young
        mortality += ((CHILD_MORTALITY_CUTOFF - age) * CHILD_MORTALITY_MULTIPLIER);
    } else if (age > ELDERLY_MORTALITY_CUTOFF) {
        mortality += ((age - ELDERLY_MORTALITY_CUTOFF) * ELDERLY_MORTALITY_MULTIPLIER);
    } else {
        // might as well check for overcrowding here - it only applies to adults that aren't too young or old.
        if (n.length > CROWDED_MAXIMUM) {
            mortality += ((n.length - CROWDED_MAXIMUM) * CROWDED_MORTALITY_MULTIPIER);
        }
    }

    // Finally, check for loneliness in children or the elderly
    if (n.length < LONELINESS_MINIMUM && (age < CHILD_MORTALITY_CUTOFF || age > ELDERLY_MORTALITY_CUTOFF)) {
        mortality += ((LONELINESS_MINIMUM - n.length) * LONLINESS_MORTALITY_MULTIPLIER);
    }

    // Let's figure out the chance if the cell dies! If the random number is below the mortality, they die.
    return Math.random() < mortality;
}

/**
 * Processes a tick in the system (ages cells a year, generates births/deaths, and generally updates the board).
 */
function tick() {
    // get a reference of the board in it's pre-tick state.
    var b = simpleBoard();

    // now go through the actual board, and update
    for (var y = 0; y < MAX_Y; y++) {
        for (var x = 0; x < MAX_X; x++) {
            // If a cell is empty, check if it breeds
            if (board[y][x].age === 0) {
                board[y][x].age = breed(y, x, b);
            } else {
                // The cell is alive! Check if it dies.
                if (die(y, x, b)) {
                    // It died, how sad.
                    board[y][x].age = 0;
                } else {
                    // It lived on for another year!
                    board[y][x].age ++;
                }
            }
        }
    }
}