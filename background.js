const canvasBG = document.getElementById("backgroundCanvas"); // récupère le canvas sur lequel est affiché le background
const ctxBG = canvasBG.getContext('2d');

ctxBG.canvas.width  = window.innerWidth;
ctxBG.canvas.height = window.innerHeight;		

const upRight = 0;
const bottomRight = 1;
const bottomLeft = 2;
const upLeft = 3;

let vanishingPointX = canvasBG.width/2;
let vanishingPointY = startingLineY + canvas.offsetTop + 15;

let starsNumber = 300;
let backgroundStars = [];

/*ctxBG.rect(vanishingPointX, vanishingPointY, , 1)
ctxBG.fillStyle = 'red';
ctxBG.fill();*/

class Star
{
	constructor(startX, startY, degree, size, speed)
	{
		this.startX = startX;
		this.startY = startY;
		this.degree = degree;
		this.size = size;
		this.speed = speed;
		this.x = startX;
		this.y = startY;
		
		if (degree < 180) 
		{
			if (degree < 90) 
			{
				this.angle = degree;
				this.quarter = upRight;
			}
			else
			{
				this.angle = degree - 90;
				this.quarter = bottomRight;
			}
		}
		else
		{
			if (degree < 270) 
			{
				this.angle = degree - 180;
				this.quarter = bottomLeft;
			}
			else
			{
				this.angle = degree - 270;
				this.quarter = upLeft;
			}
		}
	} // fin constructeur

	render(ctxBG)
	{
		ctxBG.beginPath();
		ctxBG.rect(this.x, this.y, this.size, this.size);
		ctxBG.fillStyle = 'white';
		ctxBG.fill();
		ctxBG.closePath();
	}

	getNextPosition(speed) 
	{
		if (this.degree == 0) 
		{
			this.y -= speed;
		}
		else if (this.degree == 90) 						// vérifie les 4 directions de base en premier lieu et met à jour les coordonnées
		{
			this.x += speed;				
		}
		else if (this.degree == 180) 					// si aucune touche n'est pressée, les coordonnées ne changent pas (speed = 0 par défaut)
		{							
			this.y += speed;
		}
		else if (this.degree == 270) 
		{
			this.x -= speed;
		}
		else 
		{
			let a = 0;
			let b = 0;

			a = Math.cos(this.angle*(Math.PI/180)) * speed;		// calcule les distances V et H jusqu'à la nouvelle position de xy, selon l'angle et la vitesse
			b = Math.sin(this.angle*(Math.PI/180)) * speed;

			if (this.quarter == upRight) 
			{
				this.x += b;
				this.y -= a;
			}
			else if (this.quarter == bottomRight)    // met à jour les coordonnées de l'objet avec les distances obtenues selon le quartier et donc la direction
			{
				this.x += a;
				this.y += b;
			}
			else if (this.quarter == bottomLeft) 
			{
				this.x -= b;
				this.y += a;
			}
			else if (this.quarter == upLeft) 
			{
				this.x -= a;
				this.y -= b;
			}
		} // fin else
	} // fin fonction
} // fin classe Star


function setBaseStars()
{
	for (var i = 0; i < starsNumber; i++) 
	{
		let maxDistance = getRandomInt(canvasBG.width/2)+20;
		backgroundStars.push(newStar());
		backgroundStars[i].getNextPosition(maxDistance);
		backgroundStars[i].render(ctxBG);
	}
}

function newStar()
{
	let newDegree = getRandomInt(361);
	let newSize = getRandomInt(3)+1;

	while (newDegree > 135 && newDegree < 225)
	{
		newDegree = getRandomInt(361);
	}

	return new Star(vanishingPointX, vanishingPointY, newDegree, newSize, newSize);
}

function updateBackgroundStars(backgroundStars)
{
	ctxBG.clearRect(0, 0, canvasBG.width, canvasBG.height);

	for (var i = 0; i < backgroundStars.length; i++) 
	{
		backgroundStars[i].getNextPosition(backgroundStars[i].speed);

		if (backgroundStars[i].x < 0 || backgroundStars[i].x > canvasBG.width || backgroundStars[i].y < 0 || backgroundStars[i].y > canvasBG.height) 
		{
			backgroundStars.splice(i, 1);
			let maxDistance = getRandomInt(100)+20;
			let newlyCreatedStar = newStar();
			newlyCreatedStar.getNextPosition(maxDistance);
			backgroundStars.push(newlyCreatedStar);
			i--;
		}
		else
		{
			backgroundStars[i].render(ctxBG);
		}
	}
}


setBaseStars();

for (var i = 0; i < 60; i++) // disperse les étoiles, sinon beaucoup d'entre elles sont agglutinées vers le centre durant les premières secondes
{
	updateBackgroundStars(backgroundStars);
}




let intervalId = setInterval(mainGame, baseInterval);