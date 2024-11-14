var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var oxygen = document.getElementById("Oxygen");
var oxygenSizeGui = document.getElementById("OxygenSize");
var moveSpeedGui = document.getElementById("MoveSpeed")
var fovGui = document.getElementById("Fov");
var body = document.querySelector("body");
var hardModeButton = document.getElementById("ToggleHardmode");

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
var rotationSpeed = 1.75;
var startOxygenLevel = oxygen.offsetHeight;
var oxygenTickSpeed = 400;
var lastOxygenTick = 0;
var oxygenReductionSpeed = 1;
var gameEnded = false;
var currentLevel;
var levelList = [];
var hardmode = false;

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

    //Checks what type of item that the player collided with is and executes the diffrent functions based on each
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
           if(currentLevel == lv1List){
                currentLevel = lv2List;
                objList = lv2List;
           }

           else if(currentLevel == lv2List){
                currentLevel = lv3List;
                objList = lv3List;                 
           }

           else if(currentLevel == lv3List){
                alert("Game complete")
           }

           for (let index = 0; index < objList.length; index++) {
            var element = objList[index];
            
            if(element == this){
                objList.splice(index, 1);
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

//Limits the viable area to a cone and cirlcle around the player
class Sonar {
    render(){
        
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y + player.height/2);
        ctx.save();
        ctx.translate(player.x + player.width/2, player.y + player.height/2);
        ctx.rotate(player.currentRot * Math.PI / 180);
        ctx.arc(0, 0, viewDistance, (180 - (viewAngle/2 + FovBonus/2)) * Math.PI / 180, (180 + (viewAngle/2 + FovBonus/2)) * Math.PI / 180);
        ctx.lineTo(0, 0);
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

        this.drawLineToExit();
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

        button1.innerHTML = "upgrade tank size";
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
                overlayDiv.remove();
            }

            if(e.target.id == "upgradeFov"){
                FovBonus += 20;
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
                player.resetOxygen("restart");
                gameLoop();
            }
        })
    
    }

    drawLineToExit(){
        if(!hardmode){

            objList.forEach((e) =>{
                if(e.itemType == "finishLevel"){
                    var x = e.x + e.width/2;
                    var y = e.y + e.height/2;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(player.x + player.width/2, player.y + player.height/2);
                    ctx.strokeStyle = "green";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            })
        }
    }
        
}

hardModeButton.addEventListener("click", (e) => {
    if(!hardmode){
        hardmode = true;
        hardModeButton.innerHTML = "Toggle hardmode: OFF"
    }
    else{
        hardmode = false;
        hardModeButton.innerHTML = "Toggle hardmode: ON"
    }
})


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

lv1List.push(new Wall(100,220,600,50,""));
lv1List.push(new Wall(100,380,740,50,""));      
lv1List.push(new Wall(790,178,50,200,""));
lv1List.push(new Wall(940,50,50,200,""));
lv1List.push(new Wall(1190,150,50,150,""));
lv1List.push(new Wall(1190,150,150,50,""));
lv1List.push(new Wall(-40,10,50,1100,""));
lv1List.push(new Wall(100,520,50,600,""));
lv1List.push(new Wall(240,520,50,350,""));
lv1List.push(new Wall(380,520,200,50,""));
lv1List.push(new Wall(380,660,200,50,""));
lv1List.push(new Wall(240,860,200,50,""));
lv1List.push(new Wall(530,520,50,390,""));
lv1List.push(new Wall(700,380,50,390,""));
lv1List.push(new Wall(12,10,2000,50,""));
lv1List.push(new Wall(940,380,500,50,""));
lv1List.push(new Wall(1440,10,50,1200,""));
lv1List.push(new Wall(940,380,50,200,""));
lv1List.push(new Wall(1152,520,50,200,""));
lv1List.push(new Wall(752,680,600,50,""));
lv1List.push(new Wall(1152,680,50,150,""));
lv1List.push(new Wall(752,940,740,50,""));
lv1List.push(new Wall(700,880,50,190,""));
lv1List.push(new Wall(-210,1050,960,50,""));
lv1List.push(new PickupableItem(480,575, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv1List.push(new PickupableItem(780,575, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv1List.push(new PickupableItem(1275,210, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv1List.push(new PickupableItem(1220,580,exitImg.width * 0.75, exitImg.height * 0.75,"finishLevel"))

lv2List = [];

lv2List.push(new Wall(100,380,740,50,""));
lv2List.push(new Wall(790,178,50,200,""));
lv2List.push(new Wall(940,50,50,200,""));
lv2List.push(new Wall(100,50,50,200,""));
lv2List.push(new Wall(300,178,50,200,""));
lv2List.push(new Wall(1190,550,50,150,""));
lv2List.push(new Wall(890,550,350,50,""));
lv2List.push(new Wall(-40,10,50,1225,""));
lv2List.push(new Wall(1302,730,50,150,""));
lv2List.push(new Wall(1150,800,50,150,""));
lv2List.push(new Wall(900,950,50,300,""));
lv2List.push(new Wall(1140,408,50,140,""));
lv2List.push(new Wall(100,432,50,500,""));
lv2List.push(new Wall(340,550,50,350,""));
lv2List.push(new Wall(530,550,50,350,""));
lv2List.push(new Wall(700,550,50,210,""));
lv2List.push(new Wall(12,10,2000,50,""));
lv2List.push(new Wall(940,380,250,50,""));
lv2List.push(new Wall(1340,380,125,50,""));
lv2List.push(new Wall(1240,190,225,50,""));
lv2List.push(new Wall(1440,10,50,1200,""));
lv2List.push(new Wall(940,680,50,300,""));
lv2List.push(new Wall(752,680,600,50,""));
lv2List.push(new Wall(752,940,740,50,""));
lv2List.push(new Wall(700,880,50,190,""));
lv2List.push(new Wall(-40,1050,560,50,""));
lv2List.push(new Wall(-40,1200,938,50,""));

lv2List.push(new PickupableItem(1025,800,exitImg.width * 0.75, exitImg.height * 0.75,"finishLevel"))
lv2List.push(new PickupableItem(825,800, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv2List.push(new PickupableItem(1350,80, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv2List.push(new PickupableItem(1070,450, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv2List.push(new PickupableItem(50,1110, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv2List.push(new PickupableItem(870,385, uppgradeImg.width/2, uppgradeImg.height/2,"upgrade"))
lv2List.push(new PickupableItem(440,725, uppgradeImg.width/2, uppgradeImg.height/2,"upgrade"))

lv3List = [];

lv3List.push(new Wall(-100,1000,1600,50,""));
lv3List.push(new Wall(1000,850,500,50,""));
lv3List.push(new Wall(1500,850,50,200,""));
lv3List.push(new Wall(1000,-600,50,1500,""));
lv3List.push(new Wall(-100,-100,50,1200,""));
lv3List.push(new Wall(-100,-100,1000,50,""));
lv3List.push(new Wall(-100,-600,1100,50,""));
lv3List.push(new Wall(-100,-600,1100,50,""));
lv3List.push(new Wall(-100,-600,50,500,""));
lv3List.push(new Wall(100,-600,50,300,""));
lv3List.push(new Wall(1150,400,50,300,""));
lv3List.push(new Wall(1000,400,200,50,""));
lv3List.push(new Wall(400,-600,50,150,""));
lv3List.push(new Wall(50,-300,100,50,""));
lv3List.push(new Wall(400,-302,400,50,""));
lv3List.push(new Wall(300,100,400,50,""));
lv3List.push(new Wall(300,702,600,50,""));
lv3List.push(new Wall(850,452,50,300,""));
lv3List.push(new Wall(100,452,50,300,""));
lv3List.push(new Wall(600,300,400,50,""));
lv3List.push(new Wall(600,300,50,400,""));
lv3List.push(new Wall(650,-302,50,400,""));
lv3List.push(new Wall(300,100,50,500,""));
lv3List.push(new Wall(100,400,250,50,""));
lv3List.push(new Wall(300,850,500,50,""));
lv3List.push(new Wall(800,850,50,200,""));
lv3List.push(new Wall(100,900,50,150,""));
lv3List.push(new Wall(-100,250,300,50,""));
lv3List.push(new Wall(100,100,197,50,""));
lv3List.push(new Wall(353,550,147,50,""));
lv3List.push(new Wall(450,400,147,50,""));
lv3List.push(new Wall(753,452,147,50,""));
lv3List.push(new Wall(600,580,147,50,""));
lv3List.push(new Wall(700,580,50,120,""));

lv3List.push(new PickupableItem(785,600, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv3List.push(new PickupableItem(780,520, uppgradeImg.width/2, uppgradeImg.height/2,"upgrade"))

lv3List.push(new PickupableItem(10,-520, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))
lv3List.push(new PickupableItem(0,-400, uppgradeImg.width/2, uppgradeImg.height/2,"upgrade"))

lv3List.push(new PickupableItem(575,-15, oxygenTankImg.width, oxygenTankImg.height,"oxygenTank"))

lv3List.push(new PickupableItem(1400,911,exitImg.width * 0.75, exitImg.height * 0.75,"finishLevel"))

objList = lv1List;
currentLevel = lv1List;

levelList.push(lv1List);
levelList.push(lv2List);
levelList.push(lv3List);

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
    
    audioPlayback(sonarAudio, 500, 0.1);

    player.rotateRender();

    objList.forEach(element => {
        element.render();
    })

    if(!gameEnded)
        requestAnimationFrame(gameLoop)
}

if(!gameEnded)
    gameLoop();
