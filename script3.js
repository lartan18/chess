const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
canvas.width = 600 * 4
canvas.height = 600 * 4
const squareSize = canvas.width / 8
let whiteToPlay = true
const positionToLetter = ["a", "b", "c", "d", "e", "f", "g", "h"]
ctx.imageSmoothingEnabled = true
let somePieceSelected = false
let currentBoardPosition = 0
let currentDisplayedPosition = 0

let board

let boardStorage = []

function storeBoard() {
    boardStorage.push(structuredClone(board))
    console.log(boardStorage)
}

let spritesLoaded = 0

const spriteURLs = ["Images/white king.png", "Images/white queen.png", "Images/white rook.png",
"Images/white bishop.png", "Images/white knight.png", "Images/white pawn.png", 
"Images/black king.png", "Images/black queen.png", "Images/black rook.png",
"Images/black bishop.png", "Images/black knight.png", "Images/black pawn.png", 
"Images/legal move hint light squares.png", "Images/legal move hint dark squares.png",
"Images/legal capture hint light squares.png", "Images/legal capture hint dark squares.png"]

// need to add different colors for different board colors
// need some highlight for captures

const sprites = []

for (let i = 0; i < spriteURLs.length; i++) {
    sprites[i] = new Image()
    sprites[i].src = spriteURLs[i]
}

for (let i = 0; i < sprites.length; i++) {
    sprites[i].addEventListener("load", _ => {
        spritesLoaded += 1
        if (spritesLoaded === sprites.length) {
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j] !== "") {
                        board[i][j].draw()
                    }
                }
            }
        }
    })
}


// --------------------------------------------------------------


class Init {
    constructor() {

    }
    createBoard() {
        board = []
        for (let i = 0; i < 8; i++) {
            board.push([])
                for (let j = 0; j < 8; j++) {
                board[i].push("")
                }
            }
    }
    drawBoard(darkColor, lightColor) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillStyle = lightColor
                } else {
                    ctx.fillStyle = darkColor
                }
                ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize)
            }
        }
    }
    pieces() {
        // white pieces
        board[4][7] = new King(4, 7, "white")
        board[3][7] = new Queen(3, 7, "white")
        board[0][7] = new Rook(0, 7, "white")
        board[7][7] = new Rook(7, 7, "white")
        board[2][7] = new Bishop(2, 7, "white")
        board[5][7] = new Bishop(5, 7, "white")
        board[6][7] = new Knight(6, 7, "white")
        board[1][7] = new Knight(1, 7, "white")
        for (let i = 0; i < 8; i++) {
            board[i][6] = new Pawn(i, 6, "white")
        }

        // black pieces
        board[4][0] = new King(4, 0, "black")
        board[3][0] = new Queen(3, 0, "black")
        board[0][0] = new Rook(0, 0, "black")
        board[7][0] = new Rook(7, 0, "black")
        board[2][0] = new Bishop(2, 0, "black")
        board[5][0] = new Bishop(5, 0, "black")
        board[6][0] = new Knight(6, 0, "black")
        board[1][0] = new Knight(1, 0, "black")
        for (let i = 0; i < 8; i++) {
            board[i][1] = new Pawn(i, 1, "black")
        }
    }
}

class King {
    constructor(x, y, color) {
        this.name = `${color} king`
        this.pieceType = "king"
        this.x = x
        this.y = y
        this.color = color
        this.position = positionToLetter[x] + String((7 - y) + 1) // 7 - y + 1 to turn 0 into 8, and 7 into 1 etc
        this.spriteLocation = {white: 0, black: 6}
        this.hasMoved = false
        this.inCheck = false
        this.hasLegalMoves = false
        this.legalMoveCoordinates = []
        this.legalCaptureCoordinates = []
        this.isSelected = false
    }
    draw() {
        if (this.color === "white") {
            ctx.drawImage(sprites[this.spriteLocation.white], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        } else {
            ctx.drawImage(sprites[this.spriteLocation.black], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        }
    }
    findLegalMoves() {
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (board[this.x + x][this.y + y] !== undefined) {
                    if (board[this.x + x][this.y + y] === "") {
                        this.legalMoveCoordinates.push([this.x + x, this.y + y])
                        if (x === 0 && y === 0) {
                            this.legalMoveCoordinates.pop()
                        }
                    }
                    else if (board[this.x + x][this.y + y].color !== this.color) {
                        this.legalCaptureCoordinates.push([this.x + x, this.y + y])
                        if (x === 0 && y === 0) {
                            this.legalMoveCoordinates.pop()
                        }
                    }
                }
            }
        }
        if (!this.hasMoved) {
            if (board[5][this.y] === "" && board[6][this.y] === "" && board[7][this.y] !== "") {
                if (board[7][this.y].pieceType === "rook" && !board[7][this.y].hasMoved) {
                    this.legalMoveCoordinates.push([6, this.y])
                }
            }
            if (board[1][this.y] === "" && board[2][this.y] === "" && board[3][this.y] === "" && board[0][this.y] !== "") {
                if (board[0][this.y].pieceType === "rook" && !board[0][this.y].hasMoved) {
                    this.legalMoveCoordinates.push([2, this.y])
                }
            }
        }
        if (this.isSelected) {
            this.displayLegalMoves()
        } else {
            return [this.legalMoveCoordinates, this.legalCaptureCoordinates]
        }
    }
    displayLegalMoves() {
        for (let i = 0; i < this.legalMoveCoordinates.length; i++) {
            if ((this.legalMoveCoordinates[i][0] - this.legalMoveCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[12], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[13], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
        for (let i = 0; i < this.legalCaptureCoordinates.length; i++) {
            if ((this.legalCaptureCoordinates[i][0] - this.legalCaptureCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[14], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[15], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
    }
}

class Queen {
    constructor(x, y, color) {
        this.name = `${color} queen`
        this.x = x
        this.y = y
        this.color = color
        this.position = positionToLetter[x] + String((7 - y) + 1) // 7 - y + 1 to turn 0 into 8, and 7 into 1 etc
        this.spriteLocation = {white: 1, black: 7}
        this.isSelected = false
        this.legalMoveCoordinates = []
        this.legalCaptureCoordinates = []
    }
    draw() {
        if (this.color === "white") {
            ctx.drawImage(sprites[this.spriteLocation.white], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        } else {
            ctx.drawImage(sprites[this.spriteLocation.black], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        }
    }
    findLegalMoves() {
        for (let i = 1; i + this.x < 8; i++) {
            if (board[this.x + i][this.y] !== "") {
                if (board[this.x + i][this.y].color === this.color) {
                    break
                }
                else if (board[this.x + i][this.y].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x + i, this.y])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x + i, this.y])
        }
        for (let i = -1; this.x + i > -1; i -= 1) {
            if (board[this.x + i][this.y] !== "") {
                if (board[this.x + i][this.y].color === this.color) {
                    break
                }
                else if (board[this.x + i][this.y].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x + i, this.y])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x + i, this.y])
        }
        for (let i = 1; i + this.y < 8; i++) {
            if (board[this.x][this.y + i] !== "") {
                if (board[this.x][this.y + i].color === this.color) {
                    break
                }
                else if (board[this.x][this.y + i].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x, this.y + i])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x, this.y + i])
        }
        for (let i = -1; this.y + i > -1; i -= 1) {
            if (board[this.x][this.y + i] !== "") {
                if (board[this.x][this.y + i].color === this.color) {
                    break
                }
                else if (board[this.x][this.y + i].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x, this.y + i])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x, this.y + i])
        }
        for (let i = 1; this.x + i < 8 && this.y + i < 8; i++) {
            if (board[this.x + i][this.y + i] === "") {
                this.legalMoveCoordinates.push([this.x + i, this.y + i])
            }
            else if (board[this.x + i][this.y + i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x + i, this.y + i])
                break
            } else {
                break
            }
        }
        for (let i = 1; this.x - i > -1 && i + this.y < 8; i++) {
            if (board[this.x - i][this.y + i] === "") {
                this.legalMoveCoordinates.push([this.x - i, this.y + i])
            }
            else if (board[this.x - i][this.y + i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x - i, this.y + i])
                break
            } else {
                break
            }
        }
        for (let i = 1; this.x + i < 8 && this.y - i > -1; i++) {
            if (board[this.x + i][this.y - i] === "") {
                this.legalMoveCoordinates.push([this.x + i, this.y - i])
            }
            else if (board[this.x + i][this.y - i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x + i, this.y - i])
                break
            } else {
                break
            }
        }
        for (let i = 1; this.x - i > -1 && this.y - i > -1; i++) {
            if (board[this.x - i][this.y - i] === "") {
                this.legalMoveCoordinates.push([this.x - i, this.y - i])
            }
            else if (board[this.x - i][this.y - i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x - i, this.y - i])
                break
            } else {
                break
            }
        }
        if (this.isSelected) {
            this.displayLegalMoves()
        } else {
            return [this.legalMoveCoordinates, this.legalCaptureCoordinates]
        }
    }
    displayLegalMoves() {
        for (let i = 0; i < this.legalMoveCoordinates.length; i++) {
            if ((this.legalMoveCoordinates[i][0] - this.legalMoveCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[12], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[13], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
        for (let i = 0; i < this.legalCaptureCoordinates.length; i++) {
            if ((this.legalCaptureCoordinates[i][0] - this.legalCaptureCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[14], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[15], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
    }
}

class Rook {
    constructor(x, y, color) {
        this.name = `${color} rook`
        this.pieceType = "rook"
        this.x = x
        this.y = y
        this.color = color
        this.position = positionToLetter[x] + String((7 - y) + 1) // 7 - y + 1 to turn 0 into 8, and 7 into 1 etc
        this.spriteLocation = {white: 2, black: 8}
        this.hasMoved = false
        this.isSelected = false
        this.legalMoveCoordinates = []
        this.legalCaptureCoordinates = []
    }
    draw() {
        if (this.color === "white") {
            ctx.drawImage(sprites[this.spriteLocation.white], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        } else {
            ctx.drawImage(sprites[this.spriteLocation.black], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        }
    }
    findLegalMoves() {
        for (let i = 1; i + this.x < 8; i++) {
            if (board[this.x + i][this.y] !== "") {
                if (board[this.x + i][this.y].color === this.color) {
                    break
                }
                else if (board[this.x + i][this.y].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x + i, this.y])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x + i, this.y])
        }
        for (let i = -1; this.x + i > -1; i -= 1) {
            if (board[this.x + i][this.y] !== "") {
                if (board[this.x + i][this.y].color === this.color) {
                    break
                }
                else if (board[this.x + i][this.y].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x + i, this.y])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x + i, this.y])
        }
        for (let i = 1; i + this.y < 8; i++) {
            if (board[this.x][this.y + i] !== "") {
                if (board[this.x][this.y + i].color === this.color) {
                    break
                }
                else if (board[this.x][this.y + i].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x, this.y + i])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x, this.y + i])
        }
        for (let i = -1; this.y + i > -1; i -= 1) {
            if (board[this.x][this.y + i] !== "") {
                if (board[this.x][this.y + i].color === this.color) {
                    break
                }
                else if (board[this.x][this.y + i].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x, this.y + i])
                    break
                }
            }
            this.legalMoveCoordinates.push([this.x, this.y + i])
        }
        if (this.isSelected) {
            this.displayLegalMoves()
        } else {
            return [this.legalMoveCoordinates, this.legalCaptureCoordinates]
        }
    }
    displayLegalMoves() {
        for (let i = 0; i < this.legalMoveCoordinates.length; i++) {
            if ((this.legalMoveCoordinates[i][0] - this.legalMoveCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[12], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[13], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
        for (let i = 0; i < this.legalCaptureCoordinates.length; i++) {
            if ((this.legalCaptureCoordinates[i][0] - this.legalCaptureCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[14], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[15], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
    }
}

class Bishop {
    constructor(x, y, color) {
        this.name = `${color} bishop`
        this.x = x
        this.y = y
        this.color = color
        this.position = positionToLetter[x] + String((7 - y) + 1) // 7 - y + 1 to turn 0 into 8, and 7 into 1 etc
        this.spriteLocation = {white: 3, black: 9}
        this.isSelected = false
        this.legalMoveCoordinates = []
        this.legalCaptureCoordinates = []
    }
    draw() {
        if (this.color === "white") {
            ctx.drawImage(sprites[this.spriteLocation.white], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        } else {
            ctx.drawImage(sprites[this.spriteLocation.black], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        }
    }
    findLegalMoves() {
        for (let i = 1; this.x + i < 8 && this.y + i < 8; i++) {
            if (board[this.x + i][this.y + i] === "") {
                this.legalMoveCoordinates.push([this.x + i, this.y + i])
            }
            else if (board[this.x + i][this.y + i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x + i, this.y + i])
                break
            } else {
                break
            }
        }
        for (let i = 1; this.x - i > -1 && i + this.y < 8; i++) {
            if (board[this.x - i][this.y + i] === "") {
                this.legalMoveCoordinates.push([this.x - i, this.y + i])
            }
            else if (board[this.x - i][this.y + i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x - i, this.y + i])
                break
            } else {
                break
            }
        }
        for (let i = 1; this.x + i < 8 && this.y - i > -1; i++) {
            if (board[this.x + i][this.y - i] === "") {
                this.legalMoveCoordinates.push([this.x + i, this.y - i])
            }
            else if (board[this.x + i][this.y - i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x + i, this.y - i])
                break
            } else {
                break
            }
        }
        for (let i = 1; this.x - i > -1 && this.y - i > -1; i++) {
            if (board[this.x - i][this.y - i] === "") {
                this.legalMoveCoordinates.push([this.x - i, this.y - i])
            }
            else if (board[this.x - i][this.y - i].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x - i, this.y - i])
                break
            } else {
                break
            }
        }
        if (this.isSelected) {
            this.displayLegalMoves()
        } else {
            return [this.legalMoveCoordinates, this.legalCaptureCoordinates]
        }
    }
    displayLegalMoves() {
        for (let i = 0; i < this.legalMoveCoordinates.length; i++) {
            if ((this.legalMoveCoordinates[i][0] - this.legalMoveCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[12], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[13], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
        for (let i = 0; i < this.legalCaptureCoordinates.length; i++) {
            if ((this.legalCaptureCoordinates[i][0] - this.legalCaptureCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[14], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[15], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
    }
}

class Knight {
    constructor(x, y, color) {
        this.name = `${color} knight`
        this.x = x
        this.y = y
        this.color = color
        this.position = positionToLetter[x] + String((7 - y) + 1) // 7 - y + 1 to turn 0 into 8, and 7 into 1 etc
        this.spriteLocation = {white: 4, black: 10}
        this.legalMoveCoordinates = []
        this.legalCaptureCoordinates = []
        this.reachableSquares = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]]
        this.isSelected = false
    }
    draw() {
        if (this.color === "white") {
            ctx.drawImage(sprites[this.spriteLocation.white], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        } else {
            ctx.drawImage(sprites[this.spriteLocation.black], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        }
    }
    findLegalMoves() {
        for (let i = 0; i < this.reachableSquares.length; i++) {
            if (-1 < this.x + this.reachableSquares[i][0] && -1 < this.y + this.reachableSquares[i][1] && 8 > this.x + this.reachableSquares[i][0] && 8 > this.y + this.reachableSquares[i][1]) {
                if (board[this.x + this.reachableSquares[i][0]][this.y + this.reachableSquares[i][1]] === "") {
                    this.legalMoveCoordinates.push([this.x + this.reachableSquares[i][0], this.y + this.reachableSquares[i][1]])
                } 
                else if (board[this.x + this.reachableSquares[i][0]][this.y + this.reachableSquares[i][1]].color !== this.color) {
                    this.legalCaptureCoordinates.push([this.x + this.reachableSquares[i][0], this.y + this.reachableSquares[i][1]])
                }
            }
        }
        if (this.isSelected) {
            this.displayLegalMoves()
        } else {
            return [this.legalMoveCoordinates, this.legalCaptureCoordinates]
        }
    }
    displayLegalMoves() {
        for (let i = 0; i < this.legalMoveCoordinates.length; i++) {
            if ((this.legalMoveCoordinates[i][0] - this.legalMoveCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[12], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[13], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
        for (let i = 0; i < this.legalCaptureCoordinates.length; i++) {
            if ((this.legalCaptureCoordinates[i][0] - this.legalCaptureCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[14], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[15], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
    }
}

class Pawn {
    constructor(x, y, color) {
        this.name = `${color} pawn`
        this.pieceType = "pawn"
        this.x = x
        this.y = y
        this.color = color
        this.position = positionToLetter[x] + String((7 - y) + 1) // 7 - y + 1 to turn 0 into 8, and 7 into 1 etc
        this.spriteLocation = {white: 5, black: 11}
        this.hasMoved = false
        this.justMovedDouble = false
        this.legalMoveCoordinates = []
        this.legalCaptureCoordinates = []
        this.isSelected = false
        if (this.color === "white") {
            this.direction = -1
        } else {
            this.direction = 1
        }
    }
    draw() {
        if (this.color === "white") {
            ctx.drawImage(sprites[this.spriteLocation.white], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        } else {
            ctx.drawImage(sprites[this.spriteLocation.black], this.x * squareSize, this.y * squareSize, squareSize, squareSize)
        }
    }
    findLegalMoves() {
        // y = 0 is at the top of the board, so the white pieces want to go from 6 to 0. therefore -1
        if (board[this.x][this.y + this.direction] === "") {
            if (board[this.x][this.y + this.direction * 2] === "") {
                if (!this.hasMoved) {
                    this.legalMoveCoordinates.push([this.x, this.y + (1 * this.direction)], [this.x, this.y + (2 * this.direction)])
                } else {
                    this.legalMoveCoordinates.push([this.x, this.y + (1 * this.direction)])
                }
            }
            else {
                this.legalMoveCoordinates.push([this.x, this.y + (1 * this.direction)])
            }
        }
        if (this.x + 1 < 8) {
            if (board[this.x + 1][this.y + this.direction] !== "" && board[this.x + 1][this.y + this.direction].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x + 1, this.y + this.direction])
            }
        }
        if (this.x - 1 > -1) {
            if (board[this.x - 1][this.y + this.direction] !== "" && board[this.x - 1][this.y + this.direction].color !== this.color) {
                this.legalCaptureCoordinates.push([this.x - 1, this.y + this.direction])
            }
        }

        if (this.isSelected) {
            this.displayLegalMoves()
        } else {
            return [this.legalMoveCoordinates, this.legalCaptureCoordinates]
        }
    }
    displayLegalMoves() {
        for (let i = 0; i < this.legalMoveCoordinates.length; i++) {
            if ((this.legalMoveCoordinates[i][0] - this.legalMoveCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[12], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[13], this.legalMoveCoordinates[i][0] * squareSize, this.legalMoveCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
        for (let i = 0; i < this.legalCaptureCoordinates.length; i++) {
            if ((this.legalCaptureCoordinates[i][0] - this.legalCaptureCoordinates[i][1]) % 2 === 0) {
                ctx.drawImage(sprites[14], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            } else {
                ctx.drawImage(sprites[15], this.legalCaptureCoordinates[i][0] * squareSize, this.legalCaptureCoordinates[i][1] * squareSize, squareSize, squareSize)
            }
        }
    }
}

initialize = new Init()

initialize.createBoard()
initialize.drawBoard("#769656", "#eeeed2")
initialize.pieces()
storeBoard()

function updateBoard(color1, color2) {
    initialize.drawBoard(color1, color2)
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] !== "" && board[i][j].pieceType === "pawn") {
                if ((board[i][j].y === 0 && board[i][j].color === "white") || (board[i][j].y === 7 && board[i][j].color === "black")) {
                    board[i][j] = new Queen(i, board[i][j].y, board[i][j].color)
                }
            }
            if (board[i][j] !== "") {
                board[i][j].draw()
            }
        }
    }
}

let selectedX, selectedY



canvas.addEventListener("click", (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateBoard("#769656", "#eeeed2")
    let cRect = canvas.getBoundingClientRect()
    clickedX = Math.floor((e.clientX - cRect.left) * 4 / squareSize)
    clickedY = Math.floor((e.clientY - cRect.top) * 4 / squareSize)
    console.log("click:", clickedX, clickedY)
    if ((whiteToPlay && board[clickedX][clickedY].color === "white") || (!whiteToPlay && board[clickedX][clickedY].color === "black")) {
        if (!somePieceSelected) {
            if (board[clickedX][clickedY] !== "") {
                selectedX = clickedX
                selectedY = clickedY
                for (let i = 0; i < board.length; i++) {
                    for (let j = 0; j < board[i].length; j++) {
                        if (board[i][j] !== "") {
                            board[i][j].isSelected = false
                            board[i][j].legalMoveCoordinates = []
                            board[i][j].legalCaptureCoordinates = []
                        }
                    }
                }
                board[clickedX][clickedY].isSelected = true
                somePieceSelected = true
                board[clickedX][clickedY].findLegalMoves()
            } else {
                clickedX = clickedY = selectedX = selectedY = undefined
            }
        }
        else if (somePieceSelected) {
            if (clickedX === selectedX && clickedY === selectedY) {
                somePieceSelected = false
                board[selectedX][selectedY].isSelected = false
            } 
            else {
                // handles when a piece is selected and a piece of the same color is clicked
                board[selectedX][selectedY].isSelected = false
                board[clickedX][clickedY].isSelected = true
                selectedX = clickedX
                selectedY = clickedY
                board[selectedX][selectedY].findLegalMoves()
            }
        }
        if (board[selectedX][selectedY].color !== board[clickedX][clickedY].color) {
            somePieceSelected = false
            board[selectedX][selectedY].isSelected = false
            selectedX = selectedY = undefined
        }
    }
    else if (somePieceSelected) {
        if ((whiteToPlay && (board[clickedX][clickedY].color === "black")) || (!whiteToPlay && (board[clickedX][clickedY].color === "white")) || board[clickedX][clickedY] === "") {
            let moveMade = false
            for (let i = 0; i < board[selectedX][selectedY].legalMoveCoordinates.length; i++) {
                if (board[selectedX][selectedY].legalMoveCoordinates[i][0] === clickedX && board[selectedX][selectedY].legalMoveCoordinates[i][1] === clickedY) {
                    if (board[selectedX][selectedY].pieceType === "king" || board[selectedX][selectedY].pieceType === "rook") {
                        board[selectedX][selectedY].hasMoved = true
                        if (board[selectedX][selectedY].pieceType === "king") {
                            if (clickedX - selectedX === 2) {
                                board[clickedX - 1][clickedY] = board[7][clickedY]
                                board[7][clickedY].x = clickedX - 1
                                board[7][clickedY] = ""
                            }
                            if (selectedX - clickedX === 2) {
                                board[clickedX + 1][clickedY] = board[0][clickedY]
                                board[0][clickedY].x = clickedX + 1
                                board[0][clickedY] = ""
                            }
                        }
                    }
                    if (board[selectedX][selectedY].pieceType === "pawn") {
                        board[selectedX][selectedY].hasMoved = true
                        if (selectedY - clickedY === 2 || selectedY - clickedY === -2) {
                            enPassantCoordinates = [clickedX, clickedY - board[selectedX][selectedY].direction]
                            console.log("enpassant: " + enPassantCoordinates)
                        }
                    }
                    board[clickedX][clickedY] = board[selectedX][selectedY]
                    board[selectedX][selectedY] = ""
                    board[clickedX][clickedY].x = clickedX
                    board[clickedX][clickedY].y = clickedY
                    whiteToPlay = !whiteToPlay
                    somePieceSelected = false
                    moveMade = true
                    updateBoard("#769656", "#eeeed2")
                    break
                }
            }
            if (!moveMade) {
                for (let i = 0; i < board[selectedX][selectedY].legalCaptureCoordinates.length; i++) {
                    if (board[selectedX][selectedY].legalCaptureCoordinates[i][0] === clickedX && board[selectedX][selectedY].legalCaptureCoordinates[i][1] === clickedY) {
                        if (board[selectedX][selectedY].pieceType === "king" || board[selectedX][selectedY].pieceType === "rook") {
                            board[selectedX][selectedY].hasMoved = true
                        }
                        if (board[selectedX][selectedY].pieceType === "pawn") {
                            board[selectedX][selectedY].hasMoved = true
                        }
                        board[clickedX][clickedY] = board[selectedX][selectedY]
                        board[selectedX][selectedY] = ""
                        board[clickedX][clickedY].x = clickedX
                        board[clickedX][clickedY].y = clickedY
                        whiteToPlay = !whiteToPlay
                        somePieceSelected = false
                        moveMade = true
                        updateBoard("#769656", "#eeeed2")
                        break
                    }
                }
                if (board[clickedX][clickedY] === "") {
                    somePieceSelected = false
                    selectedX = selectedY = undefined
                }
            }
        }
        storeBoard()
    }
})


window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") {
        // cycle forwards
    }
    else if (e.code = "ArrowLeft") {
        // cycle left
        board = structuredClone(boardStorage[2])
        updateBoard("#769656", "#eeeed2")
    }
})

// function animateBoard(color1, color2) {
//     updateBoard(color1, color2)
//     setTimeout(() => {
//         animateBoard(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`, 
//         `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`)

//       }, 50)
// }

// animateBoard("#769656", "#eeeed2")