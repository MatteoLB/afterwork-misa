class Sprite
{
	constructor(img, renderWidth, renderHeight, width, height, numberOfFrames, x, y, lane, totalSteps)
	{
		this.img = img;
		this.renderWidth = renderWidth;
		this.renderHeight = renderHeight;
		this.width = width;
		this.height = height;
		this.numberOfFrames = numberOfFrames;
		this.frameIndex = 0;
		this.x = x;
		this.y = y;
		this.lane = lane;
		this.jumping = false;
		this.currentStep = 0;
		this.totalSteps = totalSteps;
		this.collisionText = '-1 vie';
	}

	render(ctx, shadow) // affiche l'image
	{
		ctx.rect(this.x, this.y, this.renderWidth, this.renderHeight);
		//ctx.stroke();

		if (shadow == true) 
		{
			/*ctx.shadowOffsetY = 50;*/
			/*ctx.shadowBlur = 10;
			ctx.shadowColor = 'rgba(255,237,137,1)';*/
		}

		ctx.drawImage(this.img, this.width*this.frameIndex, 0, this.width, this.height, this.x, this.y, this.renderWidth, this.renderHeight);

		ctx.shadowColor = 'transparent';
	}

	updateSprite() // change l'image du sprite
	{
		if (this.frameIndex < this.numberOfFrames - 1) 
		{
			this.frameIndex++;
		}
		else
		{
			this.frameIndex = 0;
		}
	}

	moveObstacle(obstaclesSteps, intervalCount)
	{
		if (this.currentStep < 5 && intervalCount % 10 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
		else if (this.currentStep >= 5 && this.currentStep < 10 && intervalCount % 7 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
		else if (this.currentStep >= 10 && this.currentStep < 15 && intervalCount % 4 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
		else if (this.currentStep >= 15 && this.currentStep < 20 && intervalCount % 3 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
		else if (this.currentStep >= 20 && this.currentStep < 25 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
		else if (this.currentStep >= 25 && this.currentStep < 30 && intervalCount % 2 == 0) 
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
		else if (this.currentStep >= 30)
		{
			this.updateObstacleFrame(obstaclesSteps);
		}
	}

	updateObstacleFrame(obstaclesSteps) // déplace l'obstacle
	{
		if (this.currentStep < this.totalSteps+1) // +1 pour qu'il atteigne bien le bas, sinon il s'arrête 1 étape avant
		{
			this.renderWidth = obstaclesSteps[this.currentStep].size;
			this.renderHeight = obstaclesSteps[this.currentStep].size;
			
			if (this.lane == leftLane) 
			{
				this.x = obstaclesSteps[this.currentStep].leftLaneX;
				this.y = obstaclesSteps[this.currentStep].leftLaneY;
			}
			else if (this.lane == middleLane) 
			{
				this.x = obstaclesSteps[this.currentStep].middleLaneX;
				this.y = obstaclesSteps[this.currentStep].middleLaneY;
			}
			else if (this.lane == rightLane) 
			{
				this.x = obstaclesSteps[this.currentStep].rightLaneX;
				this.y = obstaclesSteps[this.currentStep].rightLaneY;
			}

			this.currentStep++;
		}
	}
} // fin class Sprite


class Bonus extends Sprite
{
	constructor(img, renderWidth, renderHeight, width, height, numberOfFrames, x, y, lane, totalSteps, bonusPoints, bonusLife, specialEffect, appearingChance)
	{
		super(img, renderWidth, renderHeight, width, height, numberOfFrames, x, y, lane, totalSteps);
		this.bonusPoints = bonusPoints;
		this.bonusLife = bonusLife;
		this.specialEffect = specialEffect;
		this.appearingChance = appearingChance;
		this.collisionTextFrame = 0;

		if (bonusPoints > 0) 
		{
			this.collisionText = '+'+bonusPoints+' points';
		}
		else if (bonusLife > 0) 
		{
			this.collisionText = '+'+bonusLife+' vie';
		}
	}

	gainBonus(ctx)
	{
		if (this.bonusPoints > 0)
		{
			console.log('score = ' + score);
			score += this.bonusPoints;
			return true;
		}
		else if (this.bonusLife > 0 && lifes < 3)
		{
			lifes += this.bonusLife;

			if (lifes === 3) {
				lifeSprite3.width = 65;
				lifeSprite3.height = 90;
				lifeSprite2.width = 65;
				lifeSprite2.height = 90;
				lifeSprite1.width = 65;
				lifeSprite1.height = 90;
			} 
			else if (lifes === 2) {
				lifeSprite3.width = 0;
				lifeSprite3.height = 0;
				lifeSprite2.width = 65;
				lifeSprite2.height = 90;
				lifeSprite1.width = 65;
				lifeSprite1.height = 90;
			} 
			else if (lifes === 1) {
				lifeSprite2.width = 0;
				lifeSprite2.height = 0;
				lifeSprite1.width = 65;
				lifeSprite1.height = 90;
			}
			return true;
		}
		else if (this.specialEffect == 1) 
		{
			isPillActive = true;
			minFramesBetweenObstacles += 30;

			leftKey = 39;
			rightKey = 37;
		}
		return false;
	}

	addBonus(obstaclesSteps)
	{
		let newBonusLane = getRandomInt(laneNumber);
		let newBonusX;
		let newBonusY;

		if (newBonusLane == leftLane) 
		{
			newBonusX = obstaclesSteps[0].leftLaneX;
			newBonusY = obstaclesSteps[0].leftLaneY;
		}
		else if (newBonusLane == middleLane) 
		{
			newBonusX = obstaclesSteps[0].middleLaneX;
			newBonusY = obstaclesSteps[0].middleLaneY;
		}
		else if (newBonusLane == rightLane) 
		{
			newBonusX = obstaclesSteps[0].rightLaneX;
			newBonusY = obstaclesSteps[0].rightLaneY;
		}

		this.x = newBonusX;
		this.y = newBonusY;
		this.lane = newBonusLane;
		this.renderWidth = obstaclesSteps[0].size;
		this.renderHeight = obstaclesSteps[0].size;
		this.currentStep = 0;
	}
}


class CollisionText
{
	constructor(text, x, y, type)
	{
		this.text = text;
		this.x = x;
		this.y = y;
		this.type = type;
		this.frameIndex = 0;
		this.totalFrames = 50;
	}

	renderText(ctx)
	{	
		ctx.font = "30px DS-Digital";
		/*ctx.shadowBlur = 2;
		ctx.shadowOffsetY = 2;
		ctx.shadowOffsetX = 2;
		ctx.shadowColor = 'rgba(255,255,255,1)';*/
		ctx.textAlign = "center"; 
		if (this.type == 0) {
			ctx.fillStyle = "rgba(255,88,88,"+(1 - 0.01*this.frameIndex)+')';
		} else if (this.type == 1) {
			ctx.fillStyle = "rgba(255,255,255,"+(1 - 0.01*this.frameIndex)+')';
		}

		ctx.fillText(this.text, this.x, this.y - 30 - (1*this.frameIndex));
		this.frameIndex++;
		ctx.textAlign = "start"; 
	}
}