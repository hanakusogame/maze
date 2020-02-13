import { MainScene } from "./MainScene";
declare function require(x: string): any;
//メインのゲーム画面
export class MainGame extends g.E {
	public reset: () => void;
	public setMode: (num: number) => void;

	constructor(scene: MainScene) {
		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(scene);
		const sizeW = 500;
		const sizeH = 360;
		const wallSize = 70;
		const mazeW = 27;
		const mazeH = 19;
		super({ scene: scene, x: 0, y: 0, width: sizeW, height: sizeH, touchable: true });

		//const waku = new g.Sprite({ scene: scene, src: scene.assets["waku"] });
		//this.append(waku);

		const wallBase = new g.E({ scene: scene });
		this.append(wallBase);
		wallBase.scale(0.5);
		wallBase.modified();

		const mapBase = new g.E({
			scene: scene, touchable: false, width: wallSize * ((mazeW + 1) / 2), height: wallSize * ((mazeH + 1) / 2)
		});
		wallBase.append(mapBase);
		wallBase.modified();

		const bg = new g.FilledRect({
			scene: scene,
			x: 35,
			y: 35,
			width: wallSize * 13,
			height: wallSize * 9,
			cssColor: "#303030",
			opacity: 0.5
		});
		wallBase.append(bg);

		//壁
		const walls: Wall[][] = [];
		const maps: g.FilledRect[][] = [];
		const createWalls = () => {
			const size1 = wallSize;
			const size2 = 10;
			let px = 0;
			let py = 0;
			for (let y = 0; y < mazeH; y++) {
				const h = y % 2 === 0 ? size1 : size2;
				walls.push([]);
				maps.push([]);
				px = 0;
				for (let x = 0; x < mazeW; x++) {
					const w = x % 2 === 0 ? size1 : size2;
					const wall = new Wall(scene, px, py, w, h);
					walls[y].push(wall);
					wallBase.append(wall);

					const map = new g.FilledRect({ scene: scene, x: px, y: py, width: w, height: h, cssColor: "black", opacity: 0 });
					mapBase.append(map);
					maps[y][x] = map;

					if (x % 2 === 0) {
						px += w - 5;
					} else {
						px += 5;
					}
				}
				if (y % 2 === 0) {
					py += h - 5;
				} else {
					py += 5;
				}
			}
		};
		createWalls();

		//迷路の生成
		const dx = [1, 0, -1, 0];
		const dy = [0, 1, 0, -1];
		const list2: Array<{ x: number, y: number }> = [];
		const list3: Array<{ x: number, y: number }> = [];
		const createMaze = () => {

			for (let y = 0; y < mazeH; y++) {
				for (let x = 0; x < mazeW; x++) {
					if (x === 0 || y === 0 || x === mazeW - 1 || y === mazeH - 1) {
						const wall = walls[y][x];
						wall.num = 1;
						wall.spr.hide();
					} else {
						const wall = walls[y][x];
						wall.num = 0;
						wall.spr.show();
						wall.getItem();
					}
				}
			}

			let list: Array<{ x: number, y: number }> = [];
			let px = scene.random.get(1, 12) * 2;
			let py = scene.random.get(1, 8) * 2;
			walls[py][px].num = 1;
			list2.push({ x: px, y: py });
			while (true) {
				while (true) {
					const arr: number[] = [];
					for (let i = 0; i < 4; i++) {
						const x = px + (dx[i] * 2);
						const y = py + (dy[i] * 2);
						if (walls[y][x].num === 0) arr.push(i);
					}
					if (arr.length === 0) {
						list = list.filter(p => {
							return !(px === p.x && py === p.y);
						});
						if (list3.length < 3) {
							list3.push({ x: px, y: py });
						}
						break;
					}

					if (arr.length >= 2) {
						list.push({ x: px, y: py });
					} else {
						list = list.filter(p => {
							return !(px === p.x && py === p.y);
						});
					}
					const num = arr[scene.random.get(0, arr.length - 1)];

					for (let j = 0; j < 2; j++) {
						py += dy[num];
						px += dx[num];
						walls[py][px].num = 1;
						//walls[py][px].hide();
						list2.push({ x: px, y: py });
					}
				}
				if (list.length === 0) {
					break;
				}
				const n = scene.random.get(0, list.length - 1);
				px = list[n].x;
				py = list[n].y;
			}
		};

		//プレイヤー
		const player = new Player(scene);
		wallBase.append(player);

		//ゴールの旗
		const goal = new Goal(scene);
		wallBase.append(goal);

		//const wakuF = new g.Sprite({ scene: scene, src: scene.assets["wakuf"] });
		//this.append(wakuF);

		//矢印
		const sprAngle = new g.FrameSprite({
			scene: scene,
			src: scene.assets["angle"] as g.ImageAsset,
			width: 200,
			height: 200,
			x: 155,
			y: 80,
			frames: [0, 1, 2, 3, 4]
		});
		this.append(sprAngle);

		//クリアの表示
		const sprClear = new g.Sprite({
			scene: scene,
			src: scene.assets["clear"],
			x: 150,
			y: 200,
			width: 216,
			height: 80,
			srcHeight: 80,
			srcWidth: 216
		});
		this.append(sprClear);

		//十字ボタン
		const sprJuuji = new g.FrameSprite({
			scene: scene,
			src: scene.assets["juuji"] as g.ImageAsset,
			width: 200,
			height: 200,
			x: 430,
			y: 150,
			frames: [0, 1, 2, 3, 4],
			touchable: true
		});
		this.append(sprJuuji);
		sprJuuji.hide();

		let isPush = false;
		let isGoal = false;
		let juujiNum = -1;
		let juujiNum_bk = -1;
		let tw: any;
		let test = 1;
		let stage = 0;
		let mode = 0;

		this.setMode = (num: number) => {
			mode = num;
			if (mode === 1) {
				mapBase.touchable = true;
				this.touchable = false;
				sprJuuji.hide();
			} else if (mode === 0) {
				mapBase.touchable = false;
				this.touchable = true;
				sprJuuji.hide();
			} else {
				sprJuuji.show();
				mapBase.touchable = false;
				this.touchable = false;
			}
		};

		//移動処理
		const move = () => {
			let n = juujiNum;
			let x = player.px + dx[n];
			let y = player.py + dy[n];
			if (!walls[y][x].isHidden()) {
				if (juujiNum_bk === -1 || ((juujiNum_bk + 2) % 4) === n) {
					player.setAngle(-1);
					return;
				}
				n = juujiNum_bk;
				x = player.px + dx[n];
				y = player.py + dy[n];
				if (!walls[y][x].isHidden()) {
					player.setAngle(-1);
					return;
				}
			} else {
				juujiNum_bk = -1;
			}

			if (player.angleNum === n && test !== 1.0) {
				return;
			}

			player.setAngle(n);
			x = x + dx[n];
			y = y + dy[n];
			const wall = walls[y][x];
			isStop = true;
			if (tw !== undefined) timeline.remove(tw);

			const distance = Math.sqrt((player.x - wall.x) * (player.x - wall.x) + (player.y - wall.y) * (player.y - wall.y));
			const wait = distance / wallSize * 250;

			move3(x, y, wait, wall);

		};

		const move3 = (x: number, y: number, wait: number, wall: Wall) => {
			tw = timeline.create(player, { modified: player.modified, destroyed: player.destroyed })
				.moveTo(wall.x, wall.y, wait)
				.con()
				.every((a: number, b: number) => {
					wallBase.x = -player.x + (500 - 60) / 2;
					wallBase.y = -player.y + (360 - 60) / 2;
					//wallBase.modified();
					player.move();
					test = b;
				}, wait)
				.call(() => {
					player.px = x;
					player.py = y;
					isStop = false;

					const num = wall.getItem();
					if (num === 3) {
						scene.addScore(500);
						scene.playSound("se_up");
					} else if (num !== -1) {
						scene.addScore(stage * 50);
						scene.playSound("se_move");
					}

					toItem(wall);

					toGoal();
				});
		};

		//ゴール処理
		const toGoal = () => {
			if (player.px === goal.px && player.py === goal.py) {
				//ゴールしたとき
				player.setGoal();
				goal.hide();
				isGoal = true;
				scene.addScore(1000);
				sprAngle.frameNumber = 0;
				isPush = false;
				sprAngle.modified();
				sprClear.show();
				scene.playSound("se_finish");
				timeline.create().wait(1500).call(() => {
					next();
				});
			} else {
				if (!isPush) {
					player.setAngle(-1);
				}
			}
		};

		//アイテム取得
		const toItem = (wall: Wall) => {
			const num = wall.getItem();
			if (num === 3) {
				scene.addScore(500);
				scene.playSound("se_up");
			} else if (num !== -1) {
				scene.addScore(stage * 50);
				scene.playSound("se_move");
			}
		};

		const seachMain = (gx: number, gy: number): Array<{ x: number, y: number, angle: number }> => {
			//訪問済み記録用配列
			const search: boolean[][] = [];
			for (let y = 0; y < mazeH; y++) {
				search[y] = [];
				for (let x = 0; x < mazeW; x++) {
					search[y][x] = false;
				}
			}

			let ptX = player.px;
			let ptY = player.py;
			const que: Array<{ x: number, y: number, num: number, cost: number }> = [];
			const route: Array<{ x: number, y: number, angle: number, num: number }> = [{ x: ptX, y: ptY, angle: 0, num: -1 }];
			que.push({ x: ptX, y: ptY, num: - 1, cost: 0 });
			while (que.length > 0) {
				const pt = que.shift();	//キューの先頭から取り出す
				//const pt = que.pop();	//キューの先頭から取り出す
				ptX = pt.x;
				ptY = pt.y;
				//取り出した位置がクリック地点か調べる
				if (ptY === gy && ptX === gx) {
					route.push({ x: ptX, y: ptY, angle: 0, num: pt.num });
					let num = route.length - 1;
					const arr: Array<{ x: number, y: number, angle: number }> = [];
					while (true) {
						const r = route[num];
						num = r.num;
						if ((r.x % 2) === 0 && (r.y % 2) === 0) {
							arr.push({ x: r.x, y: r.y, angle: r.angle });
						}
						if (r.num === -1) break;
					}
					return arr;
				}
				//次の探索先を現在地から右下左上の順で調べる
				if (pt.cost < 10) {
					for (let i = 0; i < 4; i++) {
						const nextX = pt.x + dx[i];
						const nextY = pt.y + dy[i];

						//次の探索先が壁ではなく、未訪問の時
						if (walls[nextY][nextX].isHidden() && !search[nextY][nextX]) {
							search[nextY][nextX] = true;//次の探索先を訪問済みにする

							//現在地をルートに追加
							route.push({ x: ptX, y: ptY, angle: i, num: pt.num });
							que.push({ x: nextX, y: nextY, num: route.length - 1, cost: pt.cost + 1 });
						}

					}
				}
			}
			return undefined;
		};

		const juujiPush = (x: number, y: number, cx: number, cy: number, sp: g.FrameSprite) => {
			const centerX = cx;
			const centerY = cy;
			const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));

			if (distance < 20) return;

			isPush = true;
			const radian = Math.atan2(centerY - y, centerX - x);
			const degree = (radian * 180 / Math.PI) + 180;
			if (degree < 45) {
				sp.frameNumber = 1;
			} else if (degree < 135) {
				sp.frameNumber = 2;
			} else if (degree < 225) {
				sp.frameNumber = 3;
			} else if (degree < 315) {
				sp.frameNumber = 4;
			} else {
				sp.frameNumber = 1;
			}
			sp.modified();
			if (juujiNum !== sp.frameNumber - 1) {
				juujiNum_bk = juujiNum;
				juujiNum = sp.frameNumber - 1;
				if (test < 0.5) {
					move();
				}
			}
		};

		//位置指定移動
		let pointX = 0;
		let pointY = 0;
		let routes: Array<{ x: number, y: number, angle: number }> = [];
		let isMove = false;

		let bkX = 0;
		let bkY = 0;
		mapBase.pointDown.add(e => {
			bkX = wallBase.x;
			bkY = wallBase.y;
			const x = Math.floor(e.point.x / wallSize) * 2;
			const y = Math.floor(e.point.y / wallSize) * 2;
			setRoute(x, y);
		});

		mapBase.pointMove.add(e => {
			const xx = wallBase.x - bkX;
			const yy = wallBase.y - bkY;
			const x = Math.floor((e.point.x + e.startDelta.x - xx) / wallSize) * 2;
			const y = Math.floor((e.point.y + e.startDelta.y - yy) / wallSize) * 2;
			setRoute(x, y);
		});

		const setRoute = (x: number, y: number) => {
			if (pointX !== x || pointY !== y) {
				pointX = x;
				pointY = y;

				const r = seachMain(x, y);//経路を取得
				if (r) {
					//経路を消す
					if (routes) {
						routes.forEach(p => {
							maps[p.y][p.x].opacity = 0;
							maps[p.y][p.x].modified();
						});
					}

					routes = r;

					//経路を描画
					for (let i = 0; i < routes.length; i++) {
						const p = routes[i];
						maps[p.y][p.x].cssColor = "yellow";
						if (i > 0) {
							maps[p.y][p.x].opacity = 0.5;
						} else {
							maps[p.y][p.x].opacity = 1;
						}
						maps[p.y][p.x].modified();
					}

					if (!isMove) {
						move2();
					}
				}
			}
		};

		const move2 = () => {
			if (isGoal || !scene.isStart) return;

			if (routes && routes.length >= 2) {
				isMove = true;
				let p = routes.pop();
				maps[p.y][p.x].opacity = 0;
				maps[p.y][p.x].modified();
				player.setAngle(p.angle);
				p = routes[routes.length - 1];
				const wall = walls[p.y][p.x];
				console.log(p.x + " " + p.y + " " + p.angle);
				player.px = p.x;
				player.py = p.y;

				timeline.create(player, { modified: player.modified, destroyed: player.destroyed })
					.moveTo(wall.x, wall.y, 250)
					.con()
					.every((a: number, b: number) => {
						wallBase.x = -player.x + (500 - 60) / 2;
						wallBase.y = -player.y + (360 - 60) / 2;
						wallBase.modified();
						player.move();
					}, 250)
					.call(() => {
						player.px = p.x;
						player.py = p.y;

						toItem(wall);
						toGoal();

						move2();
					});
			} else {
				isMove = false;
			}
		};

		let animWallCnt = 0;
		this.update.add(() => {
			if (!scene.isStart || isGoal) return;

			for (let i = 0; i < 4; i++) {
				if (animWallCnt < list2.length) {
					const x = list2[animWallCnt].x;
					const y = list2[animWallCnt].y;
					walls[y][x].spr.hide();
					if (!(player.px === x && player.py === y) && !(goal.px === x && goal.py === y)) {
						if (list3.some(e => (e.x === x) && (e.y === y))) {
							walls[y][x].setItem(3);
						} else {
							if (scene.random.get(0, 2) === 0) {
								walls[y][x].setItem(scene.random.get(0, 2));
							}
						}
					}
					animWallCnt++;
				}
			}

			if (!isPush || isStop || !scene.isStart) return;
			move();
		});

		//画面タッチ(方向指定操作のとき)
		this.pointDown.add((e) => {
			if (!scene.isStart || isGoal) return;
			const x = e.point.x;
			const y = e.point.y;
			juujiPush(x, y, sizeW / 2, sizeH / 2, sprAngle);
		});

		this.pointMove.add((e) => {
			if (!scene.isStart || isGoal) return;
			const x = e.point.x + e.startDelta.x;
			const y = e.point.y + e.startDelta.y;
			juujiPush(x, y, sizeW / 2, sizeH / 2, sprAngle);
		});

		this.pointUp.add((e) => {
			if (!scene.isStart || isGoal) return;
			sprAngle.frameNumber = 0;
			isPush = false;
			sprAngle.modified();
		});

		//十字ボタンのイベント
		sprJuuji.pointDown.add((e) => {
			if (!scene.isStart || isGoal) return;
			const x = e.point.x;
			const y = e.point.y;
			juujiPush(x, y, sprJuuji.width / 2, sprJuuji.height / 2, sprJuuji);
		});

		sprJuuji.pointMove.add((e) => {
			if (!scene.isStart || isGoal) return;
			const x = e.point.x + e.startDelta.x;
			const y = e.point.y + e.startDelta.y;
			juujiPush(x, y, sprJuuji.width / 2, sprJuuji.height / 2, sprJuuji);
		});

		sprJuuji.pointUp.add((e) => {
			if (!scene.isStart || isGoal) return;
			sprJuuji.frameNumber = 0;
			isPush = false;
			sprJuuji.modified();
		});

		//次のステージ
		const next = () => {
			stage++;
			scene.setStage(stage);
			animWallCnt = 0;
			list2.length = 0;
			list3.length = 0;
			isStop = true;
			isPush = false;
			isGoal = false;

			if (mode === 1) {
				isMove = false;
				for (let y = 0; y < mazeH; y++) {
					for (let x = 0; x < mazeW; x++) {
						maps[y][x].opacity = 0;
						maps[y][x].modified();
					}
				}
			}

			sprClear.hide();

			wallBase.moveTo(0, 0);
			wallBase.scale(0.5);

			const sx = [2, 2, 24, 24];
			const sy = [2, 16, 16, 2];

			let num = scene.random.get(0, 3);

			let wall = walls[sy[num]][sx[num]];
			player.px = sx[num];
			player.py = sy[num];
			player.moveTo(wall.x, wall.y);

			num = (num + 2) % 4;
			wall = walls[sy[num]][sx[num]];
			goal.px = sx[num];
			goal.py = sy[num];
			goal.moveTo(wall.x, wall.y);
			goal.show();

			createMaze();

			timeline.create().wait(2500).call(() => {
				wallBase.scale(1.0);
				wallBase.x = -player.x + (500 - 60) / 2;
				wallBase.y = -player.y + (360 - 60) / 2;
				wallBase.modified();
				isStop = false;
			});

			player.setAngle(1);
			player.setAngle(-1);

			test = 1;
			juujiNum = -1;
			juujiNum_bk = -1;
			sprAngle.frameNumber = 0;
			sprAngle.modified();
		};

		//リセット
		let isStop = false;
		this.reset = () => {
			stage = 0;
			next();
		};
	}
}

class Wall extends g.E {
	public num: number = 0;
	public setItem: (num: number) => void;
	public getItem: () => number;
	public spr: g.E;
	constructor(scene: MainScene, x: number, y: number, w: number, h: number) {
		super({ scene: scene, x: x, y: y });

		if (w === 10 && h === 10) {
			const spr = new g.Sprite({
				scene: scene,
				width: w,
				height: h,
				src: scene.assets["wall"]
			});
			this.append(spr);
			this.spr = spr;
		} else {
			const spr = new g.FilledRect({
				scene: scene,
				width: w,
				height: h,
				cssColor: "white"
			});
			this.append(spr);
			this.spr = spr;
		}

		let item: g.FrameSprite;
		if (w === 70 && h === 70) {
			item = new g.FrameSprite({
				scene: scene,
				width: w,
				height: h,
				src: scene.assets["item"] as g.ImageAsset,
				frames: [0, 1, 2, 3]
			});
			this.append(item);
			item.hide();
		}

		//アイテムをセット
		this.setItem = (num: number) => {
			if (item !== undefined) {
				item.frameNumber = num;
				item.modified();
				item.show();
			}
		};

		//コインをゲット(消す)
		this.getItem = () => {
			if (item !== undefined && !(item.state & g.EntityStateFlags.Hidden)) {
				item.hide();
				return item.frameNumber;
			}
			return -1;
		};
	}

	public isHidden() {
		return (this.spr.state & g.EntityStateFlags.Hidden);
	}

}

class Player extends g.E {
	public px: number = 0;
	public py: number = 0;
	public angleNum: number = 0;
	public setAngle: (num: number) => void;
	public move: () => void;
	public setGoal: () => void;

	public constructor(scene: g.Scene) {
		super({
			scene: scene,
			width: 70,
			height: 70
		});
		const spr = new g.FrameSprite({
			scene: scene,
			src: scene.assets["player"] as g.ImageAsset,
			width: 70,
			height: 140,
			y: -80,
			frames: [0, 1, 2, 1]
		});

		let frameCnt = 0;
		let frameNum = 1;
		let angleNum = -1;

		this.move = () => {
			if (frameCnt % 2 === 0) {
				frameNum = (frameNum + 1) % 4;
				spr.frameNumber = frameNum;
				spr.modified();
			}
			frameCnt++;
		};

		this.append(spr);

		this.setAngle = (num) => {
			if (num !== -1) {
				const framesBase = [0, 1, 2, 1];
				const frames: number[] = [];
				for (let i = 0; i < 4; i++) frames.push(framesBase[i] + num * 3);
				spr.frames = frames;
			} else {
				spr.frameNumber = 1;
				frameCnt = 0;
				frameNum = 1;
				spr.modified();
			}
			angleNum = num;
		};

		this.setGoal = () => {
			spr.frames = [14];
			spr.frameNumber = 0;
			spr.modified();
		};
	}
}

class Goal extends g.E {
	public px: number = 0;
	public py: number = 0;
	public angleNum: number = 0;

	public constructor(scene: g.Scene) {
		super({
			scene: scene,
			width: 70,
			height: 70
		});
		const spr = new g.Sprite({
			scene: scene,
			src: scene.assets["player"] as g.ImageAsset,
			width: 70,
			height: 140,
			y: -80,
			srcX: 0,
			srcY: 280
		});
		this.append(spr);

	}
}
