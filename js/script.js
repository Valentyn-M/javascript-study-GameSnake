// Настройка «холста»
const canvasElement = document.getElementById("canvas");
const contextCanvas = canvasElement.getContext("2d");

// Получаем ширину и высоту элемента canvas
const widthCanvas = canvasElement.width;
const heightCanvas = canvasElement.height;

// Вычисляем ширину и высоту в ячейках
const blockSize = 10;		// чтобы наши ячейки были по 10 пикселей в ширину и в высоту
const widthInBlocks = widthCanvas / blockSize;			// ширина «холста», деленная на размер ячейки, получив таким образом ширину «холста» в ячейках
const heightInBlocks = heightCanvas / blockSize;		// хранит высоту «холста» в ячейках

// Устанавливаем счет 0 (переменная для подсчета набранных игроком очков)
let score = 0;

// Функция для рисования рамки вокруг «холста» (canvas)
let drawBorder = function () {
	contextCanvas.fillStyle = "Gray";
	contextCanvas.fillRect(0, 0, widthCanvas, blockSize);			// верхняя линия
	contextCanvas.fillRect(0, heightCanvas - blockSize, widthCanvas, blockSize);		// нижняя линия
	contextCanvas.fillRect(0, 0, blockSize, heightCanvas);		// левая линия
	contextCanvas.fillRect(widthCanvas - blockSize, 0, blockSize, heightCanvas);		// правая линия
};

// Функция, которая отображает на «холсте» строку с текущим счетом игры
let drawScore = function () {
	contextCanvas.font = "20px Courier";		// размер и семейство шрифта
	contextCanvas.fillStyle = "Black";			// черный цвет текста
	contextCanvas.textAlign = "left";			// выравнивание по левому краю
	contextCanvas.textBaseline = "top";			// опорная линия текста (от верха вниз)
	contextCanvas.fillText("Счет: " + score, blockSize, blockSize);		// отображение текста
};

// Функция, которая отображает на «холсте» строку с текущим счетом игры
let drawSpeed = function () {
	contextCanvas.font = "20px Courier";		// размер и семейство шрифта
	contextCanvas.fillStyle = "Red";			// черный цвет текста
	contextCanvas.textAlign = "right";			// выравнивание по левому краю
	contextCanvas.textBaseline = "bottom";			// опорная линия текста (от верха вниз)
	contextCanvas.fillText("Максимальная скорость!", widthCanvas - blockSize, heightCanvas - blockSize);		// отображение текста
};

// Функция, вызываемая в конце игры, когда змейка врежется в стену (рамку) или в собственый хвост.
let gameOver = function () {
	gameLoop = 0;		// останавливаем игру, присвойив переменной с функцией любое другое значение
	contextCanvas.font = "50px Courier";
	contextCanvas.fillStyle = "Black";
	contextCanvas.textAlign = "center";
	contextCanvas.textBaseline = "middle";
	contextCanvas.fillText("Конец игры", widthCanvas / 2, heightCanvas / 2);
};

// Функция для отрисовки окружности
let circle = function (x, y, radius, fillCircle) {
	contextCanvas.beginPath();
	contextCanvas.arc(x, y, radius, 0, Math.PI * 2, false);
	if (fillCircle) {
		contextCanvas.fill();
	} else {
		contextCanvas.stroke();
	}
};

//------------------------------------


// Конструктор, который будет создавать объекты, представляющие собой отдельные ячейки
let Block = function (col, row) {
	this.col = col;		// позиция ячейки столбца
	this.row = row;		// позиция ячейки строки
};

// Метод drawSquare для рисования в заданной ячейке квадрата
Block.prototype.drawSquare = function (color) {
	let x = this.col * blockSize;		// для удобства x-координату ячейки заносим в переменную (умножаем на blockSize, чтобы перевести пиксели в ячейки)
	let y = this.row * blockSize;		// для удобства x-координату ячейки заносим в переменную (1=10)
	contextCanvas.fillStyle = color;
	contextCanvas.fillRect(x, y, blockSize, blockSize);
};

// Метод drawCircle для рисования в заданной ячейке окружности
Block.prototype.drawCircle = function (color) {
	let centerX = this.col * blockSize + blockSize / 2;		// находим центр окружности по x-координате
	let centerY = this.row * blockSize + blockSize / 2;		// находим центр окружности по y-координате
	contextCanvas.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true);		// функция для отрисовки окружности
};

// Метод equal, чтобы проверять, не находятся ли два объекта-ячейки в одной и той же позиции
// Вызов equal для некоего объекта-ячейки с другим объектом в качестве аргумента вернет true, если позиции двух объектов-ячеек совпадают (и false в противном случае)
Block.prototype.equal = function (otherBlock) {
	return this.col === otherBlock.col && this.row === otherBlock.row;
};

//------------------------------------

// Конструктор Snake для создания объекта-змейки
let Snake = function () {
	this.segments = [		// массив с тремя горизонтальными ячейками
		new Block(7, 5),
		new Block(6, 5),
		new Block(5, 5),
		new Block(4, 5),
		new Block(3, 5)
	];
	this.direction = "right";			// текущее направление движения змейки
	this.nextDirection = "right";		// направление змейки на следующем шаге анимации
};

// Метод draw для рисования змейки
Snake.prototype.draw = function () {
	// Цвет головы
	this.segments[0].drawSquare("Blue");
	// Цвет тела (через один)
	for (let i = 1; i < this.segments.length; i += 2) {
		this.segments[i].drawSquare("Orange");		// для каждого сегмента змеиного тела рисуем квадрат методом drawSquare (синим цветом)
	}
	for (let i = 2; i < this.segments.length; i += 2) {
		this.segments[i].drawSquare("Green");		// для каждого сегмента змеиного тела рисуем квадрат методом drawSquare (синим цветом)
	}
};

// Метод move для перемещения змейки на одну ячейку в текущем направлении
Snake.prototype.move = function () {
	let head = this.segments[0];		// первый элемент массива this.segments (это голова змейки)
	let newHead;							// переменная для хранения объекта-ячейки, представляющего собой новую змеиную голову

	this.direction = this.nextDirection;		// направление движения змейки будет соответствовать последней нажатой клавише-стрелке на клавиатуре

	// В каждом случае (в зависимости от направления) мы создаем новую змеиную голову и сохраняем ее в переменной newHead
	if (this.direction === "right") {
		newHead = new Block(head.col + 1, head.row);
	} else if (this.direction === "down") {
		newHead = new Block(head.col, head.row + 1);
	} else if (this.direction === "left") {
		newHead = new Block(head.col - 1, head.row);
	} else if (this.direction === "up") {
		newHead = new Block(head.col, head.row - 1);
	}

	// Проверяем, не врезалась ли змейка в свой хвост или в стену
	if (this.checkCollision(newHead)) {		// вызываем метод checkCollision (возвращает true, если змейка на что-то наткнулась)
		gameOver();
		return;
	}
	this.segments.unshift(newHead);		// добавляем змейке новую голову, с помощью unshift
	// Сравниваем newHead и apple.position
	if (newHead.equal(apple.position)) {		// если позиция этих объектов-ячеек одинакова, метод equal вернет true и это будет означать, что змейка съела яблоко
		score++;				// увеличиваем счет игры
		apple.move();		// перемещая яблоко в новую позицию (напишем далее)
		// Увеличиваем скорость змейки
		if (animationTime <= 30) {
			animationTime = 30;
		} else if (animationTime >= 130) {
			animationTime = animationTime - 10;
		} else if (animationTime < 130 && animationTime >= 100) {
			animationTime = animationTime - 5;
		} else if (animationTime < 100 && animationTime >= 50) {
			animationTime = animationTime - 2;
		} else {
			animationTime = animationTime - 1;
		}
	} else {		// В противном случае (если змейка не съела яблоко) удаляем сегмент змеиного хвоста
		this.segments.pop();
	}
};

// Метод checkCollision для проверки столкновения змейки с со стенами и с собственным телом
Snake.prototype.checkCollision = function (head) {
	// Эта переменная примет значение true, если змейка столкнется с какой-лтбо стенкой...
	let leftCollision = (head.col === 0);
	let topCollision = (head.row === 0);
	let rightCollision = (head.col === widthInBlocks - 1);
	let bottomCollision = (head.row === heightInBlocks - 1);

	// Определяем, столкнулась ли змейка с какойнибудь из стенок: с помощью операции || (ИЛИ)
	let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

	// Проверка столкновения с собственным телом
	let selfCollision = false;
	for (let i = 0; i < this.segments.length; i++) {
		if (head.equal(this.segments[i])) {		// проверяем, не находится ли какой-нибудь из сегментов змейки в той же позиции, что и новая голова змейки
			selfCollision = true;		// если змейка столкнулась сама с собой, то присваиваем selfCollision значение true
		}
	}

	// Возвращаем из метода wallCollision или selfCollision выражение, которое даст true, если змейка столкнулась либо со стенкой, либо сама с собой
	return wallCollision || selfCollision;
};

// Метод setDirection, чтобы установить новое направление движения змейки
Snake.prototype.setDirection = function (newDirection) {
	// Запрещаем игроку менять направление змейки на противоположное
	if (this.direction === "up" && newDirection === "down") {
		return;
	} else if (this.direction === "right" && newDirection === "left") {
		return;
	} else if (this.direction === "down" && newDirection === "up") {
		return;
	} else if (this.direction === "left" && newDirection === "right") {
		return;
	}

	// Обновляем свойство объекта-змейки nextDirection
	this.nextDirection = newDirection;
};

//------------------------------------

// Конструктор Apple для создания яблок (используем для создания объекта-яблока в самом начале игры)
let Apple = function () {
	// Перемещаем яблоко в случайную новую позицию
	let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
	let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
	this.position = new Block(randomCol, randomRow);
};

// Метод draw для рисования яблока
Apple.prototype.draw = function () {
	this.position.drawCircle("LimeGreen");		// вызываем метод drawCircle
};

// Метод move перемещает яблоко в случайную новую позицию
Apple.prototype.move = function () {
	// Проверка появляния яблока в теле змейки
	let checkCount;		// пременная для работы цикла (счетчик проверки)
	do {
		// Обнуляем счетчик
		checkCount = 0

		// Перемещаем яблоко в случайную позицию
		let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
		let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
		this.position = new Block(randomCol, randomRow);		// создаем новый объект-ячейку в случайной позиции

		// Проверка появления яблока в теле змейки
		for (let i = 0; i < snake.segments.length; i++) {		// перебираем все блоки тела змейки
			if (this.position.equal(snake.segments[i])) {		// проверяем, не находится ли какой-нибудь из сегментов змейки в той же позиции, что и яблоко
				checkCount--;		// если позиция яблока совпала с одним из элементов змейки
			} else {
				checkCount++;		// если яблоко не в теле змейки
			};
		};
		/*
		На выходе из цикла for: если счетчик проверки(checkCount) = длине змейки(snake.segments.length),
		то цикл while больше не повторяется. В противном случае цикл while будет повторяться
		до тех пор пока не будет выполнено условие checkCount === snake.segments.length
		*/

	} while (checkCount < snake.segments.length);
};

//------------------------------------

// Создаем объект-змейку и объект-яблоко
let snake = new Snake();
let apple = new Apple();

// Скорость игры
let animationTime = 200;

// Запускаем анимцию всего (эта функция вызывает сама себя)
let gameLoop = function () {
	contextCanvas.clearRect(0, 0, widthCanvas, heightCanvas);
	drawScore();
	if (animationTime <= 30) {
		drawSpeed();
	}
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
	// Запускаем функцию анимации через setTimeout через вермя animationTime
	setTimeout(gameLoop, animationTime);
};
gameLoop();

// Преобразуем коды клавиш в направления
let directions = {
	ArrowLeft: "left",
	ArrowUp: "up",
	ArrowRight: "right",
	ArrowDown: "down"
};
// Обработчик события keydown
const bodyElement = document.body;
bodyElement.addEventListener("keydown", function (event) {
	let newDirection = directions[event.code];		// преобразовываем полученный из объекта-события код клавиши в строку с названием направления
	if (newDirection !== undefined) {			// если полученный код клавиши не равен undefined, значит нажата клавиша-стрелка
		snake.setDirection(newDirection);		// вызываем метод setDirection (создадим далее) объекта-змейки (snake), передавая ему строку newDirection
	}
});

// Ставим игру на паузу (срабатывает только один раз)
let pause = {
	Space: "stop",
	Enter: "play"
};
bodyElement.addEventListener("keydown", function (event) {
	let pauseGame = pause[event.code];		// преобразовываем полученный из объекта-события код клавиши в строку с названием направления
	if (pauseGame !== undefined) {			// если полученный код клавиши не равен undefined, значит нажата клавиша-стрелка
		if (pauseGame === "stop") {
			gameLoop = 0;
		};
	}
});
bodyElement.addEventListener("keydown", function (event) {
	let pauseGame = pause[event.code];		// преобразовываем полученный из объекта-события код клавиши в строку с названием направления
	if (pauseGame !== undefined) {			// если полученный код клавиши не равен undefined, значит нажата клавиша-стрелка
		if (pauseGame === "play") {
			let gameLoop = function () {
				contextCanvas.clearRect(0, 0, widthCanvas, heightCanvas);
				drawScore();
				snake.move();
				snake.draw();
				apple.draw();
				drawBorder();
				// Запускаем функцию анимации через setTimeout через вермя animationTime
				setTimeout(gameLoop, animationTime);
			};
			gameLoop();
		}
	}
});




