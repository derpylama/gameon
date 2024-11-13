var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var oxygen = document.getElementById("Oxygen");
var oxygenSizeGui = document.getElementById("OxygenSize");
var moveSpeedGui = document.getElementById("MoveSpeed")
var fovGui = document.getElementById("Fov");
var body = document.querySelector("body");

var moveUp;
var moveLeft;
var moveDown;
var moveRight;
var movementStopY = false;
var movementStopX = false;

//Game imgages
var playerImg = new Image();
playerImg.src = "./img/player.png";
var oxygenTankImg = new Image();
oxygenTankImg.src = "./img/oxygenTank.png";
var uppgradeImg = new Image();
uppgradeImg.src = "./img/upgrade.png";
var exitImg = new Image();
exitImg.src = "./img/exit.png"

//Uppgrades
var oxygenBonus = 0;
var movementBonus = 0;
var FovBonus = 0;

//Game adjustment
var viewDistance = 250;
var viewAngle = 60;
var speed = 2;
var rotationSpeed = 1;
var startOxygenLevel = oxygen.offsetHeight;
var oxygenTickSpeed = 300;
var lastOxygenTick = 0;
var oxygenReductionSpeed = 1;
var gameEnded = false;
var currentLevel;
var levelList = [];

//Audio
var lastPlaybackTime = 0;
var sonarAudio = new Audio("./sounds/sonar.mp3");
var ambiance = new Audio("./sounds/ambiance.ogg");

function audioPlayback(audioObj, delay, volume){
    audioObj.volume = volume;

    if(lastPlaybackTime = 0 || delay < new Date() - lastPlaybackTime){
        audioObj.play();
        lastPlaybackTime = new Date();
    }
}

//Input handling
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
            
            collisionDetectedX = (this.x < player.x + player.width &&
                this.x + this.width > player.x) || (player.x < this.x + this.width && player.x + player.width > this.x);

            collisionDetectedY = this.y < player.y + player.height && this.y + this.height > player.y;

            if(moveUp){
                if(collisionDetectedY && player.x > this.x && player.x < this.x + this.width){
                    movementStopY = true;
                    this.reaction("Y");
                }
                if(collisionDetectedX && (this.y < player.y + player.height/2 && this.y + this.height > player.y)){
                    movementStopX = true;
                    this.reaction("X");
                }
            }

            else if(moveDown){
                if(collisionDetectedY && player.x > this.x && player.x < this.x + this.width){
                    movementStopY = true;
                    this.reaction("Y");
                }
                if(collisionDetectedX && (this.y < player.y + player.height/2 && this.y + this.height > player.y)){
                    movementStopX = true;
                    this.reaction("X");
                }
            }
            else{
                movementStopY = false;
                movementStopX = false;
            }
        
        }
    
    reaction(direction){
        //Stops all object when one has collided
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
            this.dy = (speed + movementBonus) * Math.sin(angle);  
        }

        if(!movementStopX){
            this.dx = (speed + movementBonus) * Math.cos(angle);
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
        ctx.fillRect(this.x - 2, this.y - 2,this.width + 4, this.height + 4)

        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height); 
           
    }

}

class PickupableItem{
    constructor(x, y, width, height, itemType){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.itemType = itemType;
        this.lastOverlayTime = 0;
        this.overlayDelay = 1000;
    }

    detection(){
        if(this.x + this.width > player.x && this.x < player.x + player.width && this.y < player.y && this.y + this.height > player.y + player.height){
            this.pickup();
        };
        
        if(this.y < player.y + player.height && this.y + this.height > player.y && player.x > this.x && player.x < this.x + this.width){
            this.pickup();
        }
    }

    pickup(){
        if(this.itemType == "oxygenTank"){
            player.resetOxygen();
        }
        if(this.itemType == "upgrade"){
            if(this.lastOverlayTime == 0 || new Date() - this.lastOverlayTime > this.overlayDelay){
                gui.UpgradeOverlay();

                for (let index = 0; index < objList.length; index++) {
                    var element = objList[index];
                    
                    if(element == this){
                        objList.splice(index, 1);
                    }
                }

                this.lastOverlayTime = new Date();
            }
        }
        if(this.itemType == "finishLevel"){
            for (let index = 0; index < levelList.length; index++) {
                var level = levelList[index];
                
                if(currentLevel == level){
                    
                    if(!levelList[index + 1] == undefined){
                        currentLevel = levelList[index + 1];
                        objList = currentLevel;

                    }
                    else{
                        alert("Game Complete")
                    }
                }
            }
        }
    }

    move(){

        var angle = player.currentRot * Math.PI/180;

        if(!movementStopY){
            this.dy = (speed + movementBonus) * Math.sin(angle);  
        }

        if(!movementStopX){
            this.dx = (speed + movementBonus) * Math.cos(angle);
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

        if(this.itemType == "oxygenTank"){
            ctx.drawImage(oxygenTankImg, this.x, this.y, this.width, this.height);
        }

        if(this.itemType == "finishLevel"){
            ctx.drawImage(exitImg, this.x, this.y, this.width, this.height);
        }

        if(this.itemType == "upgrade"){
            ctx.drawImage(uppgradeImg, this.x, this.y, this.width, this.height);
        }
        
    }
}

class Sonar {
    render(){
        
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y + player.height/2);
        ctx.save();
        ctx.translate(player.x + player.width/2, player.y + player.height/2);
        ctx.rotate(player.currentRot * Math.PI / 180);
        ctx.arc(0, 0, viewDistance, (180 - (viewAngle/2 + FovBonus/2)) * Math.PI / 180, (180 + (viewAngle/2 + FovBonus/2)) * Math.PI / 180);
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.arc(0,0, 60, 0, 2 * Math.PI)
        
        ctx.restore();
        ctx.clip();
    }
}

class Gui{
    update(){
        var oxygenTankSize = oxygenTickSpeed + oxygenBonus;
        var moveSpeed = speed + movementBonus;
        var fieldOfView = viewAngle + FovBonus;

        oxygenSizeGui.innerHTML = "Tank size: " + oxygenTankSize;
        moveSpeedGui.innerHTML = "Move speed: " + moveSpeed;
        fovGui.innerHTML = "Field of view: " + fieldOfView + "°";
    }
    
    UpgradeOverlay(){
        var button1 = document.createElement("button");
        var button2 = document.createElement("button");
        var button3 = document.createElement("button");
        var button4 = document.createElement("button");
    
        button1.id = "upgradeOxygen";
        button2.id = "upgradeMovement";
        button3.id = "upgradeFov";
        button4.id = "exitMenu";

        button1.innerHTML = "upgrade oxygen";
        button2.innerHTML = "upgrade movement speed";
        button3.innerHTML = "upgrade field of view";
        button4.innerHTML = "Close menu";
        
        var overlayDiv = document.createElement("div");
        overlayDiv.classList = "upgrade";
    
        overlayDiv.appendChild(button1);
        overlayDiv.appendChild(button2);
        overlayDiv.appendChild(button3);
        overlayDiv.appendChild(button4);
        
        if(document.querySelectorAll(".upgrade").length < 1)
            body.appendChild(overlayDiv);

        overlayDiv.addEventListener("click", (e) => {
            if(e.target.id == "upgradeOxygen"){
                oxygenBonus += 50;
                overlayDiv.remove();
            }

            if(e.target.id == "upgradeMovement"){
                var newSpeed = Math.round((movementBonus + .2) * 10)/10
                movementBonus = newSpeed;
            }

            if(e.target.id == "upgradeFov"){
                FovBonus += 10;
                overlayDiv.remove();
            }

            if(e.target.id == "exitMenu"){
                overlayDiv.remove();
            }
        })
    }
    
    gameOver() {
        var gameOverText;
        
        if(player.currentOxygen <= 0){
            gameOverText = "you ran out of oxygen";
        }
    
        var gameOverP = document.createElement("p")
        var gameOverDiv = document.createElement("div");
        var restartButton = document.createElement("button");
        gameOverDiv.classList = "gameover";
        gameOverP.innerHTML = gameOverText;
        restartButton.id = "restart";
        restartButton.innerHTML = "Restart level";

        if(document.querySelectorAll(".gameover").length < 1){
            gameOverDiv.appendChild(gameOverP);
            gameOverDiv.appendChild(restartButton);

            body.appendChild(gameOverDiv);
            
            gameEnded = true
        }

        gameOverDiv.addEventListener("click", (e) => {
            if(e.target.id == "restart"){
                objList = currentLevel;
                gameOverDiv.remove();
                gameEnded = false;
                gameLoop();
                player.resetOxygen("restart");
            }
        })
    
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
        this.currentOxygen = startOxygenLevel;
        this.currentOxygenTickSpeed = oxygenTickSpeed;
    }

    rotateRender(){
        this.currentRot = this.currentRot + this.rotation;

        if(this.img == ""){
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.currentRot * Math.PI / 180);
            ctx.fillStyle = "white";
            ctx.fillRect(-this.width / 2 - 5, -this.height / 2 - 5, this.width + 10, this.height + 10);
            ctx.fillStyle = "black";
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
        else{
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.currentRot * Math.PI / 180);
            ctx.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height)
            ctx.restore();
        }
    }

    update(){
        if(moveLeft){
            this.rotation = -rotationSpeed;
        }

        if(moveRight){
            this.rotation = rotationSpeed;
        }
        
        if(!moveLeft && !moveRight){
            this.rotation = 0;
        }

        this.oxygenAmount();
    }

    oxygenAmount(){
        if(lastOxygenTick == 0 || new Date() - lastOxygenTick > this.currentOxygenTickSpeed){
            this.currentOxygen -= oxygenReductionSpeed;
            
            if(oxygenBonus > 0 && this.currentOxygenTickSpeed < oxygenTickSpeed + oxygenBonus){
                this.currentOxygenTickSpeed += oxygenBonus;
            }
            
            oxygen.style.height = this.currentOxygen + "px"
            lastOxygenTick = new Date();
            console.log("oxy")
            if(this.currentOxygen <= 0){
                gui.gameOver();
            }
        }
    }

    resetOxygen(command){
        if(command == "restart"){
            this.currentOxygenTickSpeed = oxygenTickSpeed;
            this.currentOxygen = startOxygenLevel;
        }
        else{
            this.currentOxygenTickSpeed = oxygenTickSpeed + oxygenBonus;
            this.currentOxygen = startOxygenLevel;
        }
    }
}

var player = new Player(490, 290, playerImg.width, playerImg.height,playerImg);
var sonar = new Sonar();
var gui = new Gui();

objList = [];
lv1List = [];

lv1List.push(new Wall(300,220,100,100,""));


lv1List.push(new PickupableItem(50,50, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv1List.push(new PickupableItem(100,50,exitImg.width * 0.75, exitImg.height * 0.75,"finishLevel"))
lv1List.push(new PickupableItem(150,400, uppgradeImg.width/2, uppgradeImg.height/2,"upgrade"))

objList = lv1List;
currentLevel = lv1List;

levelList.push(lv1List);

function gameLoop (){
    ctx.reset();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    sonar.render();

    objList.forEach(element => {
        element.move();
    });
    
    for (let index = 0; index < objList.length; index++) {
        var element = objList[index];
        element.detection(player);        
    }

    gui.update();
    
    audioPlayback(sonarAudio, 800, 0.01);
    audioPlayback(ambiance, 600, 1);

    player.rotateRender();

    objList.forEach(element => {
        element.render();
    })

    if(!gameEnded)
        requestAnimationFrame(gameLoop)
}

if(!gameEnded)
    gameLoop();
