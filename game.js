const canvas = document.getElementById("gameCanvas"); // récupère le canvas sur lequel est affiché le jeu
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById("gameContainer");

const fireImg = document.getElementById('fire');
const horrorCatImg = document.getElementById('horrorcat');
const candyImg = document.getElementById('candy');
const pillImg = document.getElementById('pill');
const syringeImg = document.getElementById('syringe');
const waterImg = document.getElementById('water');

const bonusListContent = document.getElementById('bonusListContent');
const rankingsContent = document.getElementById('rankingsContent');
const playerName = document.getElementById('playerName');
const sendRanking = document.getElementById('sendRanking');


canvas.width  = gameContainer.offsetWidth;
canvas.height = gameContainer.offsetHeight;

const laneNumber = 3;	// changer la condition dans getPlayerLocation en cas de modification du nombre de couloirs
const laneWidth = canvas.width/laneNumber; // établit le nombre de couloirs, leur largeur, la hauteur des lignes, et le nombre de lignes

const leftLane = 0;
const middleLane = 1;
const rightLane = 2;

let leftKey = 37;
let rightKey = 39;

let playerCurrentLane = middleLane;

let currentObstacleCount = 0;	// nombre actuel d'obstacles générés
let maxObstacleCount = 7;		// nombre maximum d'obstacles présentes en même temps
let obstacleAppearingChance = 120; // probabilité par défaut de générer un nouvel obstacle (1 sur N), voir fonction newObstacle()
let framesSinceLastObstacle = 1; // nombre de frames depuis que le dernier obstacle a été généré (pour éviter des obstacles trop rapprochés)
let minFramesBetweenObstacles = 60;


let score = 0;	
let gameStatus = 1; // statut actuel du jeu, 1 pour en cours, 0 pour game over
let lifes = 3;
let difficultyLevel = 0;
let difficultyIncreaseRate = 200;
let difficultyIncreaseSteps = [40, 80, 130, 180, 240, 300, 400, 500, 700, 1400, 2200, 3100, 4500, 6500];

let isPillActive = false;
let pillEffectCount = 0;
let pillEffectMaxDuration = 800;

let startingLineWidth = 10; // largeur de la ligne d'horizon sur laquelle apparaissent les obstacles
let startingLineX = canvas.width/2 - startingLineWidth/2; // startingLine -> 20 pixels de large ?
let startingLineY = canvas.height/10 * 6; // placée à X/10 en partant du haut, modifier la valeur change l'angle de vue

let totalSteps = 50; // nombre total d'étapes pour que l'obstacle parcoure la map
let obstaclesSteps = []; // tableau d'objets qui stockera toutes les étapes de tous les obstacles
let obstacles = []; // tableau d'objets qui contiendra tous les obstacles
let elements = []; // contient tous les éléments affichés hormis le joueur (obstacles et bonus)

let allBonus = []; // contient tous les bonus
let activeBonus = []; // contient tous les bonus actuellement visibles
let collisionText = []; // contient les textes affichés lors d'un gain de bonus ou perte de vie

let ranking = []; // contient les classements



function getRandomInt(max) // génère un entier aléatoire entre 0 et max (non inclus)
{
  return Math.floor(Math.random() * Math.floor(max));
}

function handleKeyDown(event) // gère l'évènement appui de touche clavier
{
	if (event.keyCode == leftKey) // left
	{
		if (playerSprite.lane == middleLane)
		{
			playerSprite.lane = leftLane;
			playerSprite.x = (laneWidth - playerSprite.renderWidth)/2;
		}
		else if (playerSprite.lane == rightLane)
		{
			playerSprite.lane = middleLane;
			playerSprite.x = laneWidth + (laneWidth - playerSprite.renderWidth)/2;
		}
	}
	else if (event.keyCode == rightKey) // right
	{
		if (playerSprite.lane == middleLane)
		{
			playerSprite.lane = rightLane;
			playerSprite.x = laneWidth*2 + (laneWidth - playerSprite.renderWidth)/2;
		}
		else if (playerSprite.lane == leftLane)
		{
			playerSprite.lane = middleLane;
			playerSprite.x = laneWidth + (laneWidth - playerSprite.renderWidth)/2;
		}
	}
	else if (event.keyCode == 72) // si touche pressée = h
	{
		if (bonusListContent.hidden == true) 
		{
			bonusListContent.hidden = false;
		}
		else
		{
			bonusListContent.hidden = true;
		}
	}
	else if (event.keyCode == 67) // si touche pressée = c
	{
		if (rankingsContent.hidden == true) 
		{
			rankingsContent.hidden = false;
		}
		else
		{
			rankingsContent.hidden = true;
		}
	}
}

function drawStartingLine() // dessine la ligne du fond, d'où les obstacles apparaissent
{
	ctx.beginPath();
	ctx.moveTo(startingLineX, startingLineY);
	ctx.lineTo(startingLineX+startingLineWidth, startingLineY);
	ctx.stroke();
	ctx.closePath();
}

function drawLanesLines() // dessine des lignes pour tracer les couloirs
{
	for (var i = 0; i < laneNumber+1; i++)
	{
		ctx.beginPath()
		ctx.moveTo(laneWidth*i, canvas.height);
		ctx.lineTo(startingLineX+(startingLineWidth/laneNumber)*i, startingLineY);
		ctx.stroke();
		ctx.closePath();
	}
}

function setObstaclesSteps() // alimente un tableau d'objets qui contient toutes les coordonnées et la taille qu'auront les obstacles
{
	let distanceX = startingLineX+startingLineWidth/laneNumber - laneWidth;
	let distanceY = canvas.height - startingLineY;

	for (var i = 0; i < totalSteps+1; i++)
	{
		let leftX = (startingLineX+startingLineWidth/laneNumber) - (distanceX/totalSteps)*i;
		let rightX = (startingLineX+startingLineWidth/laneNumber*2) + (distanceX/totalSteps)*i;
		let y = startingLineY + (distanceY/totalSteps)*i;

		let size = Math.abs(leftX - rightX);

		obstaclesSteps.push({
			leftLaneX: leftX - size,
			leftLaneY: y - size,
			middleLaneX: leftX,
			middleLaneY: y - size,
			rightLaneX: rightX,
			rightLaneY: y - size,
			size: size
		});
	}
}

function newObstacle() // génère un nouvel obstacle
{
	let newObstacleLane = getRandomInt(laneNumber);
	let newObstacleX;
	let newObstacleY;
	let newObstacle;

	if (newObstacleLane == leftLane)
	{
		newObstacleX = obstaclesSteps[0].leftLaneX;
		newObstacleY = obstaclesSteps[0].leftLaneY;
	}
	else if (newObstacleLane == middleLane)
	{
		newObstacleX = obstaclesSteps[0].middleLaneX;
		newObstacleY = obstaclesSteps[0].middleLaneY;
	}
	else if (newObstacleLane == rightLane)
	{
		newObstacleX = obstaclesSteps[0].rightLaneX;
		newObstacleY = obstaclesSteps[0].rightLaneY;
	}

	if (getRandomInt(2) == 1) // une chance sur 2 d'avoir des flammes ou un chat
	{
		newObstacle = new Sprite(fireImg, // image
						  obstaclesSteps[0].size, // renderWidth
						  obstaclesSteps[0].size, // renderHeight
						  308, // width
						  308, // height
						  4, // numberOfFrames
						  newObstacleX, // x
						  newObstacleY, // y
						  newObstacleLane, // lane
						  totalSteps); // totalSteps
	}
	else
	{
		newObstacle = new Sprite(horrorCatImg, // image
						  obstaclesSteps[0].size, // renderWidth
						  obstaclesSteps[0].size, // renderHeight
						  100, // width
						  100, // height
						  8, // numberOfFrames
						  newObstacleX, // x
						  newObstacleY, // y
						  newObstacleLane, // lane
						  totalSteps); // totalSteps
	}

	obstacles.push(newObstacle);
	elements.unshift(newObstacle);
	return newObstacleLane;
}

function handleNewObstacles() // gère la création des nouveaux obstacles
{
	if (currentObstacleCount < maxObstacleCount)
	{
		if ((getRandomInt(obstacleAppearingChance) == 1 || currentObstacleCount <= 1) && framesSinceLastObstacle > minFramesBetweenObstacles)
		{
			newObstacle();
			framesSinceLastObstacle = 0;
			return true;
		}
	}
	return false;
}

function createAllBonus() // crée tous les bonus 
{
	let candy = new Bonus(candyImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												380, // width
												380, // height
												1, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												50, // bonus points
												0, // bonus life
												0, // speical effect (for pills)
												60); // appearing chance

	let pill = new Bonus(pillImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												250, // width
												250, // height
												1, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												0, // bonus points
												0, // bonus life
												1, // special effect
												300); // appearing chance

		let syringe = new Bonus(syringeImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												114, // width
												114, // height
												1, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												0, // bonus points
												1, // bonus life
												0, // special effect (for pills)
												1000); // appearing chance

		let water = new Bonus(waterImg, // image
												obstaclesSteps[0].size, // renderWidth
												obstaclesSteps[0].size, // renderHeight
												400, // width
												400, // height
												6, // numberOfFrames
												0, // x
												0, // y
												middleLane, // lane
												totalSteps, // totalSteps
												30, // bonus points
												0, // bonus life
												0, // special effect (for pills)
												0); // appearing chance

	allBonus = [candy, pill, syringe]; // + water ?
}

function handleNewBonus(allBonus) // gère l'ajout de nouveaux bonus
{
	for (let i = 0; i < allBonus.length; i++)
	{
		let currentElement = allBonus[i];

		if (currentElement.x == 0 && getRandomInt(currentElement.appearingChance) == 1)
		{
			if (currentElement.specialEffect == 0 || isPillActive == false) 
			{
				currentElement.addBonus(obstaclesSteps);
				activeBonus.push(currentElement);
				elements.unshift(currentElement);
				return;
			}
		}
	}
}

function handleAllNewElements() // gère l'ajout de nouveaux bonus & obstacles
{
	let newObstacle = handleNewObstacles();

	if (newObstacle === false && framesSinceLastObstacle > 10 /*&& (minFramesBetweenObstacles - framesSinceLastObstacle) > 5*/)
	{
		handleNewBonus(allBonus);
	}
}

function updateElements(elements, obstaclesSteps, intervalCount) // met à jour les éléments (obstacles et bonus)
{
	for (var i = 0; i < elements.length; i++)
	{
		if (elements[i].currentStep == totalSteps+1)
		{
			if (elements[i].appearingChance > 0)
			{
				if (elements[i].lane == playerSprite.lane)
				{
					let bonusAdded = elements[i].gainBonus(ctx); // remplacer 0 par life

					if (bonusAdded) 
					{
						collisionText.push(new CollisionText(elements[i].collisionText, playerSprite.x+laneWidth/2, elements[i].y, 1));	
					}
				}
				
				elements[i].x = 0;			
			}
			else
			{
				if (elements[i].lane == playerSprite.lane)
				{
						lifes--;
						collisionText.push(new CollisionText(elements[i].collisionText, playerSprite.x+laneWidth/2, elements[i].y, 0));

						if (lifes === 2) 
						{
								lifeSprite3.width = 0;
								lifeSprite3.height = 0;
								lifeSprite2.width = 65;
								lifeSprite2.height = 90;
								lifeSprite1.width = 65;
								lifeSprite1.height = 90;
								lifes = 2;
						} 
						else if (lifes === 1) 
						{
								lifeSprite2.width = 0;
								lifeSprite2.height = 0;
								lifeSprite1.width = 65;
								lifeSprite1.height = 90;
								lifes = 1;
						} 
						else if (lifes === 0) // si on n'a plus de vies, game over
						{
								ctx.fillStyle = 'white';
								ctx.font = "50px DS-Digital";
								
								lifeSprite1.width = 0;
								lifeSprite1.height = 0;
								lifes = 0;
								gameOver();							
						}
				} // if (elements[i].lane == playerSprite.lane)
			}
			elements.splice(i, 1);
			i--;
		} // fin if (elements[i].currentStep == totalSteps+1)
		else
		{
			if (elements[i].appearingChance > 0) 
			{
				elements[i].render(ctx, true);	// pour ajouter un halo aux bonus
			}
			else
			{
				elements[i].render(ctx, false);
			}

			elements[i].moveObstacle(obstaclesSteps, intervalCount);

			if (intervalCount % 10 == 0)
			{
				elements[i].updateSprite();
			}

			if (!elements[i].appearingChance)
			{
				currentObstacleCount++;
			}
		}
	} // fin for
} // fin updateElements(elements, obstaclesSteps, intervalCount)

function handleDifficulty() // gère l'augmentation de la difficulté
{
	ctx.font = "50px DS-Digital";
	ctx.fillText("level " + difficultyLevel, 330, 133);


	if (intervalCount/6 > difficultyIncreaseSteps[difficultyLevel])  // /6 pour coller à l'incrémentation du score 1x toutes les 6 frames
	{
		difficultyLevel++;

		if (minFramesBetweenObstacles > 20) 
		{
			minFramesBetweenObstacles -= 5;
		}

		if (baseInterval - difficultyLevel > 0) 
		{
			for (var i = 0; i < allBonus.length; i++) 
			{
				allBonus[i].appearingChance += difficultyLevel*5;
			}

			pillEffectMaxDuration -= 20;

			clearInterval(intervalId);
			intervalId = setInterval(mainGame, baseInterval - difficultyLevel);
		}
	}
}

function handlePillBonus() // gère le bonus des pilules 
{
	score++;
	pillEffectCount++;
		
	updateElements(elements, obstaclesSteps, intervalCount); // met à jour les éléments une 2ème fois pour doubler la vitesse
		

	if (pillEffectCount > pillEffectMaxDuration) 
	{
		isPillActive = false;
		pillEffectCount = 0;
		minFramesBetweenObstacles -= 30;

		leftKey = 37;
		rightKey = 39;
	}
}

function drawScore() {
  ctx.font = "50px DS-Digital";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Score: " + score, 135, 200);

}

function drawLife() {
  ctx.fillText("x" + lifes, 280, 133);
}

function updateRanking(e) // met à jour le classement
{
	e.preventDefault();
	sendRanking.disabled = true;

	if (localStorage.getItem('ranking') && playerName.value != '' && playerName.value != null) 
	{
		let name = playerName.value;
		ranking = JSON.parse(localStorage.getItem('ranking'));

		ranking.push({name: name, score: score});

		localStorage.setItem('ranking', JSON.stringify(ranking));
	}
	else if (playerName.value != '' && playerName.value != null)
	{
		let name = playerName.value;
		ranking.push({name: name, score: score});
		localStorage.setItem('ranking', JSON.stringify(ranking));
	}

	if (localStorage.getItem('ranking')) 
	{
		ranking = JSON.parse(localStorage.getItem('ranking'));

		displayRanking(ranking);
	}
}

function displayRanking(ranking) // affiche le classement
{
	let rankerItem;
	let rankerRank;
	let rankerName;
	let rankerScore;
	let orderedRankings = ranking;
	let rank = 0;

	if (ranking.length > 1) 
	{
		orderedRankings.sort(function(a, b) {
		    return parseFloat(a.score) - parseFloat(b.score);
		});
	}
	
	while(rankingsContent.firstChild)
	{
		rankingsContent.removeChild(rankingsContent.firstChild);
	}

	for (var i = orderedRankings.length - 1; i >= 0; i--) 
	{
		rank++;
		rankerItem = document.createElement('div');
		rankerItem.classList.add('rankerItem');

		rankerRank = document.createElement('p');
		rankerRank.textContent = rank;

		rankerName = document.createElement('p');
		rankerName.textContent = orderedRankings[i].name;

		rankerScore = document.createElement('p');
		rankerScore.textContent = orderedRankings[i].score;

		rankerItem.appendChild(rankerRank);
		rankerItem.appendChild(rankerName);
		rankerItem.appendChild(rankerScore);
		rankingsContent.appendChild(rankerItem);

		if (rank == 10) 
		{
			return;
		}
	}
}

function mainGame() // fonction principale, lancée dans le setInterval
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	currentObstacleCount = 0; // remet le compteur d'obstacles à 0 (ceux-ci sont comptés lorsqu'ils sont déplacés et dessinés)
	framesSinceLastObstacle++;	// incrémente le compteur de frames depuis le dernier obstacle
	intervalCount++;


	updateElements(elements, obstaclesSteps, intervalCount);

	if (isPillActive) // si le joueur a consommé une pilule et qu'elle est toujours active
	{
		handlePillBonus();
		updateBackgroundStars(backgroundStars); // remet à jour le background (effet d'accélération)
	}

	handleAllNewElements(); // gère l'apparition de nouveaux éléments
	drawScore();			// affiche le score

	playerSprite.render(ctx, false); // affiche les sprites joueur et vies
	lifeSprite1.render(ctx);
  	lifeSprite2.render(ctx);
  	lifeSprite3.render(ctx);


	if (intervalCount % 6 == 0) // met à jour les sprites joueur, vies, et le background, et incrémente le score 1 fois toutes les 6 frames
	{
		score++;
		playerSprite.updateSprite();
	    lifeSprite1.updateSprite();
	    lifeSprite2.updateSprite();
	    lifeSprite3.updateSprite();
		//console.log('score = ' + score);

		updateBackgroundStars(backgroundStars);
	}

	if (collisionText.length > 0) // si il y a des textes de collision à afficher (+50 points, -1 vie, etc)
	{
		for (let i = 0; i < collisionText.length; i++)
		{
			collisionText[i].renderText(ctx);

			if (collisionText[i].frameIndex === 50) // chaque texte est affiché durant 50 frames, puis est retiré du tableau
			{
				collisionText.splice(i, 1);
				i--;
			}
		}
	}

	handleDifficulty();
}

// ****************************************************************************************************************************************************


window.addEventListener('keydown', handleKeyDown); // ajoute l'event listener clavier
sendRanking.addEventListener('click', updateRanking); // met à jour le classement lorsqu'on clique sur le bouton envoyer
setObstaclesSteps(); // établit la liste des étapes des obstacles et bonus
createAllBonus(); // crée les objets de base des bonus

if (localStorage.getItem('ranking'))  // affiche le classement, si il y a déjà des données à afficher
{
	ranking = JSON.parse(localStorage.getItem('ranking'));

	displayRanking(ranking);
}


// initialise le sprite du joueur
let playerSprite = new Sprite(document.getElementById('kissounours'), // image
							  170, // renderWidth, changer aussi le calcul dans x si on le change
							  145, // renderHeight
							  300, // width
							  254, // height
							  4, // numberOfFrames
							  laneWidth + (laneWidth - 170)/2, // x (200 = renderWidth)
							  canvas.height-143, // y
							  middleLane, // lane
							  0); // totalSteps


// initialise les sprite des vies
let lifeSprite1 = new Sprite(document.getElementById('lifes'), // image
  50, // renderWidth, changer aussi le calcul dans x si on le change
  70, // renderHeight
  65, // width
  90, // height
  2, // numberOfFrames
  130, // x (200 = renderWidth)
  93, // y
  middleLane, // lane
  0); // totalSteps

let lifeSprite2 = new Sprite(document.getElementById('lifes'), // image
  50, // renderWidth, changer aussi le calcul dans x si on le change
  70, // renderHeight
  65, // width
  90, // height
  2, // numberOfFrames
  180, // x (200 = renderWidth)
  93, // y
  middleLane, // lane
  0); // totalSteps

let lifeSprite3 = new Sprite(document.getElementById('lifes'), // image
  50, // renderWidth, changer aussi le calcul dans x si on le change
  70, // renderHeight
  65, // width
  90, // height
  2, // numberOfFrames
  230, // x (200 = renderWidth)
  93, // y
  middleLane, // lane
  0); // totalSteps



let intervalCount = 0; // compteur du setInterval
let baseInterval = 15; // valeur de base du setInterval, lancé dans background.js






// ***********************************************************************************************************************************



// close icon in modal
let closeicon = document.querySelector(".close");

// declare modal
let modal = document.getElementById("popup1")


function gameOver()
{
        clearInterval(intervalId);

        // show game over modal
        modal.classList.add("show");

        //showing move, rating, time on modal
        document.getElementById("finalMove").innerHTML = score;

        playerName.value = '';
        //closeicon on modal
        closeModal();
    };

function closeModal(){
    closeicon.addEventListener("click", function(e){
        modal.classList.remove("show");
        startGame();
    });
}


function playAgain() // pour relancer la partie
{
    modal.classList.remove("show");
    startGame();
}

function startGame() // remet les variables à 0 avant de relancer le jeu
{
	document.location.reload(true);
}