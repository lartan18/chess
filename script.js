const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
canvas.width = 480 * 16
canvas.height = 480 * 16
const squareSize = canvas.width / 8
let whiteToPlay = true

class King {
    constructor(currentX, currentY, color) {
        this.color = color
        this.currentX = currentX
        this.currentY = currentY
        this.hasMoved = true
        this.inCheck = false
        this.hasLegalMoves = false

    }
    detectAvailableSquares() {

    }
}

class Pawn {
    constructor(currentX, currentY, color) {
        this.color = color
        this.currentX = currentX
        this.currentY = currentY
        this.canMoveTwoSquares = true
        this.canEnPassant = false
        this.canCapture = false
    }
    detectAvailableSquares() {

    }
    detectCaptures() {

    }
}

let mouseX = 0
let mouseY = 0

ctx.imageSmoothingEnabled = true

const piecesURL = ["Images/white king.png", "Images/white queen.png", "Images/white rook.png",
"Images/white bishop.png", "Images/white knight.png", "Images/white pawn.png", 
"Images/black king.png", "Images/black queen.png", "Images/black rook.png",
"Images/black bishop.png", "Images/black knight.png", "Images/black pawn.png"
]

let loadedImages = 0

pieces = []

for (let i = 0; i < piecesURL.length; i++) {
    pieces[i] = new Image()
    pieces[i].src = piecesURL[i]
}

for (let i = 0; i < pieces.length; i++) {
    pieces[i].addEventListener("load", function() {
        loadedImages += 1
    });
}

function drawPieces() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            switch (board[i][j]) {
                case "wK":
                    ctx.drawImage(pieces[0], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "wQ":
                    ctx.drawImage(pieces[1], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "wR":
                    ctx.drawImage(pieces[2], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "wB":
                    ctx.drawImage(pieces[3], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "wN":
                    ctx.drawImage(pieces[4], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "wP":
                    ctx.drawImage(pieces[5], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "bK":
                    ctx.drawImage(pieces[6], j * squareSize, i * squareSize, squareSize, squareSize)
                    
                    break;
                case "bQ":
                    ctx.drawImage(pieces[7], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "bR":
                    ctx.drawImage(pieces[8], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "bB":
                    ctx.drawImage(pieces[9], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "bN":
                    ctx.drawImage(pieces[10], j * squareSize, i * squareSize, squareSize, squareSize)
                    break;
                case "bP":
                    ctx.drawImage(pieces[11], j * squareSize, i * squareSize, squareSize, squareSize)
                    
                    break;
            }
        }
    }
}

// b = black, w = white. R=rook, N=knight, B=bishop, K=king, Q=queen, P=pawn

const board = [
    ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
    ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
    ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
]

const objectBoard = [
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""]
]

function updatePieces() {
    for (let i = 0; i < objectBoard.length; i++) {
        for (let j = 0; j < objectBoard.length; j++) {
            switch (objectBoard[i][j]) {
                case King:
                    board[i][j] = "wK"
            }
        }
    }
}

function drawBoard(lightColor, darkColor, highlightColor) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillStyle = `${lightColor}`
            } else {
                ctx.fillStyle = `${darkColor}`
            }
            // if (i === clickedX && j === clickedY) {
            //     ctx.fillStyle = `${highlightColor}`
            // }
            ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize)
        }
    }
}

const testWhitePiece = /w/
const testBlackPiece = /b/

let selectedPiece

let pieceIsSelected = false

canvas.addEventListener("click", (e) => {
    let cRect = canvas.getBoundingClientRect()
    clickedX = Math.floor((e.clientX - cRect.left) * 16 / squareSize)
    clickedY = Math.floor((e.clientY - cRect.top) * 16 / squareSize)
    if (!pieceIsSelected) {
        if (board[clickedY][clickedX] !== "") {
            selectedPiece = board[clickedY][clickedX]
            if (whiteToPlay && testWhitePiece.test(selectedPiece)) {
                oldPieceX = clickedX
                oldPieceY = clickedY
                pieceIsSelected = true
            }
            else if (!whiteToPlay && testBlackPiece.test(selectedPiece)) {
                oldPieceX = clickedX
                oldPieceY = clickedY
                pieceIsSelected = true
            } else {
                selectedPiece = undefined
            }
        }
    }
    else if (pieceIsSelected) {
        if (whiteToPlay && testWhitePiece.test(selectedPiece)) {
            console.log(0)
            if (!testWhitePiece.test(board[clickedY][clickedX])) {
                objectBoard[oldPieceY][oldPieceX].currentY = clickedY
                objectBoard[oldPieceY][oldPieceX].currentX = clickedX
                console.log(objectBoard)
                board[clickedY][clickedX] = selectedPiece
                board[oldPieceY][oldPieceX] = ""
                whiteToPlay = false
                pieceIsSelected = false
                selectedPiece = undefined
            } else {
                selectedPiece = board[clickedY][clickedX]
                oldPieceX = clickedX
                oldPieceY = clickedY
            }
        }
        else if (!whiteToPlay && testBlackPiece.test(selectedPiece)) {
            console.log(1)
            if (!testBlackPiece.test(board[clickedY][clickedX])) {
                console.log(2)
                board[clickedY][clickedX] = selectedPiece
                board[oldPieceY][oldPieceX] = ""
                whiteToPlay = true
                pieceIsSelected = false
                selectedPiece = undefined
            } else {
                selectedPiece = board[clickedY][clickedX]
                oldPieceX = clickedX
                oldPieceY = clickedY
            }
        }
        
    }
    console.log(selectedPiece, whiteToPlay)
})


// initialize object board using draw board
for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        switch (board[i][j]) {
            case "wK":
                objectBoard[i][j] = new King(j, i, "white")
                break;
            case "wP":
                objectBoard[i][j] = new Pawn(j, i, "white")
                break;
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBoard("white", "green", "lime")
    if (loadedImages >= piecesURL.length) {
        updatePieces()
        drawPieces()
    }
    setTimeout(gameLoop, 100)
}

console.log(objectBoard)

gameLoop()