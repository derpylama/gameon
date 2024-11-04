canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

var moveUp;
var moveLeft;
var moveDown;
var moveRight;

document.addEventListener("keydown", (e) =>{
    if(e.key == "w"){
        moveUp = true;
    }
        
    if(e.key == "s"){
        moveDown = true;
    }

    if(e.key == "a"){
        moveLeft = true;
    }

    if(e.key == "d"){
        moveRight = true;
    }
    
});


document.addEventListener("keyup", (e) =>{
    if(e.key == "w"){
        moveUp = false;
    }
        
    if(e.key == "s"){
        moveDown = false;
    }

    if(e.key == "a"){
        moveLeft = false;
    }

    if(e.key == "d"){
        moveRight = false;
    }
});

class Player {
    constructor(x, y, width, height, img, speed){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
        this.speed = speed;
        this.vY = 0;
        this.vX = 0;
    }

    move(){
        
        if(this.y < 0){
            this.y = 0;
        }

        if(this.y + this.height > canvas.height){
            this.y = canvas.height - this.height;
        }

        if(moveUp){
            this.vY = -this.speed;
        }

        if(moveDown){
            this.vY = this.speed;
        }

        if(moveLeft){
            this.vX = -this.speed;
        }

        if(moveRight){
            this.vX = this.speed;
        }

        if(moveUp || moveDown){
            this.y += this.vY
        }

        if(moveLeft || moveRight){
            this.x = this.x + this.vX
        }


    }

    render(){
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height); 
    }

}

objList = [];
objList.push(new Player(50,50,20,20,"",1))


function gameLoop (){

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    objList.forEach(element => {
        element.move();
    });


    objList.forEach(element => {
        element.render();
    })
    
    requestAnimationFrame(gameLoop)
}


gameLoop();
