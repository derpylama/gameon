canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

var moveUp;
var moveLeft;
var moveDown;
var moveRight;

var speed = 1;

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

class Gameobj{
    constructor(x, y, width, height, img,){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
        this.vY = 0;
        this.vX = 0;
    }

    move(){

        var angle = player.currentRot * Math.PI/180;
        var dx;
        var dy;


        if(angle != 0){
            dx = speed * Math.cos(angle);
            dy = speed * Math.sin(angle);
        }
        else{
            dy = 1;
            dx = 0;
        }

        if(moveUp){
            this.vY = -dy;
            this.vX = -dx
        }

        if(moveDown){
            this.vY = dy;
            this.vX = dx;
        }


        if(moveUp || moveDown){
            this.y += this.vY;
            this.x += this.vX;
        }
    }   

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
        ctx.fillRect(-this.width / 2 - 5, -this.height / 2 - 5, this.width + 10, this.height + 10)
        ctx.fillStyle = "black";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height) 
        ctx.restore();
    }

    update(){
        if(moveLeft){
            this.rotation = -1;
        }

        if(moveRight){
            this.rotation = 1;
        }
        
        if(!moveLeft && !moveRight){
            this.rotation = 0;
        }
    }
}

var player = new Player(490,290,20,20,"",1) 

visibleObjList = [];

objList = [];
objList.push(new Gameobj(100,100,500,60,""))
objList.push(new Gameobj(100,500,500,60,""))


function gameLoop (){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    player.rotateRender();

    objList.forEach(element => {
        element.move();
    });


    objList.forEach(element => {
        element.render();
    })
    
    requestAnimationFrame(gameLoop)
}


gameLoop();
