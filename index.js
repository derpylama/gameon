canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

var moveUp;
var moveLeft;
var moveDown;
var moveRight;
var movementStopY = false;
var movementStopX = false;


var speed = 2;
var RotSpeed = 2;

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

class Wall{
    constructor(x, y, width, height, img,){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
        this.vY = 0;
        this.vX = 0;
        this.dx = 0;
        this.dy = 0;
    }
    
    detection(player){
            var collisionDetectedX = false;
            var collisionDetectedY = false;
            
            
            for (let i = 0; i < objList.length; i++) {
            
                    collisionDetectedX = this.x + this.width > player.x && this.x < player.x + player.width;
                    collisionDetectedY = this.y < player.y + player.height && this.y + this.height > player.y;             

                    var xObjLimitLeft = player.x > this.x;
                    var xObjLimitRight = player.x < this.x + this.width;

                    if(collisionDetectedY && moveUp && xObjLimitLeft && xObjLimitRight){
                        movementStopY = true;
                        
                        this.reaction("Y")
                    }
                    else if(collisionDetectedY && moveDown && xObjLimitLeft && xObjLimitRight){
                        movementStopY = true;
                        
                        this.reaction("Y")
                    }
                    else if(collisionDetectedY){
                        movementStopY = false;
                        
                    } 
                    
                    if(collisionDetectedX && moveUp && this.y < player.y && this.y + this.height > player.y + player.height){
                        movementStopX = true;
                        this.reaction("X");
                    }
                    else if(collisionDetectedX && moveDown && this.y < player.y && this.y + this.height > player.y + player.height){
                        movementStopX = true;
                        this.reaction("X");
                    }
                    else if(collisionDetectedX && !moveDown && !moveUp){
                        movementStopX = false;
                    }

                }
            
            }
    
    reaction(direction){
        
        if(direction === "Y"){
            objList.forEach((e) => {
                e.dy = 0;
                e.vY = 0;
            
            })
        }
        else if(direction === "X"){
            objList.forEach((e) => {
                e.dx = 0;
                e.vX = 0;
            
            })
        }
    }

    move(){

        var angle = player.currentRot * Math.PI/180;

        if(!movementStopY){
            this.dy = speed * Math.sin(angle);  
        }

        if(!movementStopX){
            this.dx = speed * Math.cos(angle);
        }

        if(moveUp){
            this.vY = this.dy;
            this.vX = this.dx
        }

        if(moveDown){
            this.vY = -this.dy;
            this.vX = -this.dx;
        }

        if(moveUp || moveDown){
            this.y += this.vY;
            this.x += this.vX;
        }
    }; 

    render(){
        ctx.fillStyle = "white";
        ctx.fillRect(this.x - 5, this.y - 5,this.width + 10 ,this.height + 10)

        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height); 
    }

}

class Player {
    constructor(x, y, width, height, img){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
        this.vY = 0;
        this.vX = 0;
        this.rotation = 0;
        this.currentRot = 0;
    }

    rotateRender(){
        this.currentRot = this.currentRot + this.rotation;

        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.currentRot * Math.PI / 180);
        ctx.fillStyle = "white";
        ctx.fillRect(-this.width / 2 - 5, -this.height / 2 - 5, this.width + 10, this.height + 10);
        ctx.fillStyle = "black";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    update(){
        if(moveLeft){
            this.rotation = -2;
        }

        if(moveRight){
            this.rotation = 2;
        }
        
        if(!moveLeft && !moveRight){
            this.rotation = 0;
        }
    }

}

var player = new Player(490,290,20,20,"");

visibleObjList = [];

objList = [];

objList.push(new Wall(50,100,30,100,""));
objList.push(new Wall(100,200,30,100,""));

function gameLoop (){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    player.update();
    
    objList.forEach(element => {
        element.move();
    });
    
    objList.forEach((element) => {
        element.detection(player);
    })

    player.rotateRender();

    objList.forEach(element => {
        element.render();
    })
    
    requestAnimationFrame(gameLoop)
}


gameLoop();
