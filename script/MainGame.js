"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//メインのゲーム画面
var MainGame = /** @class */ (function (_super) {
    __extends(MainGame, _super);
    function MainGame(scene) {
        var _this = this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(scene);
        var sizeW = 500;
        var sizeH = 360;
        var wallSize = 70;
        var mazeW = 27;
        var mazeH = 19;
        _this = _super.call(this, { scene: scene, x: 0, y: 0, width: sizeW, height: sizeH, touchable: true }) || this;
        //const waku = new g.Sprite({ scene: scene, src: scene.assets["waku"] });
        //this.append(waku);
        var wallBase = new g.E({ scene: scene });
        _this.append(wallBase);
        wallBase.scale(0.5);
        wallBase.modified();
        var mapBase = new g.E({
            scene: scene, touchable: false, width: wallSize * ((mazeW + 1) / 2), height: wallSize * ((mazeH + 1) / 2)
        });
        wallBase.append(mapBase);
        wallBase.modified();
        var bg = new g.FilledRect({
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
        var walls = [];
        var maps = [];
        var createWalls = function () {
            var size1 = wallSize;
            var size2 = 10;
            var px = 0;
            var py = 0;
            for (var y = 0; y < mazeH; y++) {
                var h = y % 2 === 0 ? size1 : size2;
                walls.push([]);
                maps.push([]);
                px = 0;
                for (var x = 0; x < mazeW; x++) {
                    var w = x % 2 === 0 ? size1 : size2;
                    var wall = new Wall(scene, px, py, w, h);
                    walls[y].push(wall);
                    wallBase.append(wall);
                    var map = new g.FilledRect({ scene: scene, x: px, y: py, width: w, height: h, cssColor: "black", opacity: 0 });
                    mapBase.append(map);
                    maps[y][x] = map;
                    if (x % 2 === 0) {
                        px += w - 5;
                    }
                    else {
                        px += 5;
                    }
                }
                if (y % 2 === 0) {
                    py += h - 5;
                }
                else {
                    py += 5;
                }
            }
        };
        createWalls();
        //迷路の生成
        var dx = [1, 0, -1, 0];
        var dy = [0, 1, 0, -1];
        var list2 = [];
        var list3 = [];
        var createMaze = function () {
            for (var y = 0; y < mazeH; y++) {
                for (var x = 0; x < mazeW; x++) {
                    if (x === 0 || y === 0 || x === mazeW - 1 || y === mazeH - 1) {
                        var wall = walls[y][x];
                        wall.num = 1;
                        wall.spr.hide();
                    }
                    else {
                        var wall = walls[y][x];
                        wall.num = 0;
                        wall.spr.show();
                        wall.getItem();
                    }
                }
            }
            var list = [];
            var px = scene.random.get(1, 12) * 2;
            var py = scene.random.get(1, 8) * 2;
            walls[py][px].num = 1;
            list2.push({ x: px, y: py });
            while (true) {
                while (true) {
                    var arr = [];
                    for (var i = 0; i < 4; i++) {
                        var x = px + (dx[i] * 2);
                        var y = py + (dy[i] * 2);
                        if (walls[y][x].num === 0)
                            arr.push(i);
                    }
                    if (arr.length === 0) {
                        list = list.filter(function (p) {
                            return !(px === p.x && py === p.y);
                        });
                        if (list3.length < 3) {
                            list3.push({ x: px, y: py });
                        }
                        break;
                    }
                    if (arr.length >= 2) {
                        list.push({ x: px, y: py });
                    }
                    else {
                        list = list.filter(function (p) {
                            return !(px === p.x && py === p.y);
                        });
                    }
                    var num = arr[scene.random.get(0, arr.length - 1)];
                    for (var j = 0; j < 2; j++) {
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
                var n = scene.random.get(0, list.length - 1);
                px = list[n].x;
                py = list[n].y;
            }
        };
        //プレイヤー
        var player = new Player(scene);
        wallBase.append(player);
        //ゴールの旗
        var goal = new Goal(scene);
        wallBase.append(goal);
        //const wakuF = new g.Sprite({ scene: scene, src: scene.assets["wakuf"] });
        //this.append(wakuF);
        //矢印
        var sprAngle = new g.FrameSprite({
            scene: scene,
            src: scene.assets["angle"],
            width: 200,
            height: 200,
            x: 155,
            y: 80,
            frames: [0, 1, 2, 3, 4]
        });
        _this.append(sprAngle);
        //クリアの表示
        var sprClear = new g.Sprite({
            scene: scene,
            src: scene.assets["clear"],
            x: 150,
            y: 200,
            width: 216,
            height: 80,
            srcHeight: 80,
            srcWidth: 216
        });
        _this.append(sprClear);
        //十字ボタン
        var sprJuuji = new g.FrameSprite({
            scene: scene,
            src: scene.assets["juuji"],
            width: 200,
            height: 200,
            x: 430,
            y: 150,
            frames: [0, 1, 2, 3, 4],
            touchable: true
        });
        _this.append(sprJuuji);
        sprJuuji.hide();
        var isPush = false;
        var isGoal = false;
        var juujiNum = -1;
        var juujiNum_bk = -1;
        var tw;
        var test = 1;
        var stage = 0;
        var mode = 0;
        _this.setMode = function (num) {
            mode = num;
            if (mode === 1) {
                mapBase.touchable = true;
                _this.touchable = false;
                sprJuuji.hide();
            }
            else if (mode === 0) {
                mapBase.touchable = false;
                _this.touchable = true;
                sprJuuji.hide();
            }
            else {
                sprJuuji.show();
                mapBase.touchable = false;
                _this.touchable = false;
            }
        };
        //移動処理
        var move = function () {
            var n = juujiNum;
            var x = player.px + dx[n];
            var y = player.py + dy[n];
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
            }
            else {
                juujiNum_bk = -1;
            }
            if (player.angleNum === n && test !== 1.0) {
                return;
            }
            player.setAngle(n);
            x = x + dx[n];
            y = y + dy[n];
            var wall = walls[y][x];
            isStop = true;
            if (tw !== undefined)
                timeline.remove(tw);
            var distance = Math.sqrt((player.x - wall.x) * (player.x - wall.x) + (player.y - wall.y) * (player.y - wall.y));
            var wait = distance / wallSize * 250;
            move3(x, y, wait, wall);
        };
        var move3 = function (x, y, wait, wall) {
            tw = timeline.create(player, { modified: player.modified, destroyed: player.destroyed })
                .moveTo(wall.x, wall.y, wait)
                .con()
                .every(function (a, b) {
                wallBase.x = -player.x + (500 - 60) / 2;
                wallBase.y = -player.y + (360 - 60) / 2;
                //wallBase.modified();
                player.move();
                test = b;
            }, wait)
                .call(function () {
                player.px = x;
                player.py = y;
                isStop = false;
                var num = wall.getItem();
                if (num === 3) {
                    scene.addScore(500);
                    scene.playSound("se_up");
                }
                else if (num !== -1) {
                    scene.addScore(stage * 50);
                    scene.playSound("se_move");
                }
                toItem(wall);
                toGoal();
            });
        };
        //ゴール処理
        var toGoal = function () {
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
                timeline.create().wait(1500).call(function () {
                    next();
                });
            }
            else {
                if (!isPush) {
                    player.setAngle(-1);
                }
            }
        };
        //アイテム取得
        var toItem = function (wall) {
            var num = wall.getItem();
            if (num === 3) {
                scene.addScore(500);
                scene.playSound("se_up");
            }
            else if (num !== -1) {
                scene.addScore(stage * 50);
                scene.playSound("se_move");
            }
        };
        var seachMain = function (gx, gy) {
            //訪問済み記録用配列
            var search = [];
            for (var y = 0; y < mazeH; y++) {
                search[y] = [];
                for (var x = 0; x < mazeW; x++) {
                    search[y][x] = false;
                }
            }
            var ptX = player.px;
            var ptY = player.py;
            var que = [];
            var route = [{ x: ptX, y: ptY, angle: 0, num: -1 }];
            que.push({ x: ptX, y: ptY, num: -1, cost: 0 });
            while (que.length > 0) {
                var pt = que.shift(); //キューの先頭から取り出す
                //const pt = que.pop();	//キューの先頭から取り出す
                ptX = pt.x;
                ptY = pt.y;
                //取り出した位置がクリック地点か調べる
                if (ptY === gy && ptX === gx) {
                    route.push({ x: ptX, y: ptY, angle: 0, num: pt.num });
                    var num = route.length - 1;
                    var arr = [];
                    while (true) {
                        var r = route[num];
                        num = r.num;
                        if ((r.x % 2) === 0 && (r.y % 2) === 0) {
                            arr.push({ x: r.x, y: r.y, angle: r.angle });
                        }
                        if (r.num === -1)
                            break;
                    }
                    return arr;
                }
                //次の探索先を現在地から右下左上の順で調べる
                if (pt.cost < 10) {
                    for (var i = 0; i < 4; i++) {
                        var nextX = pt.x + dx[i];
                        var nextY = pt.y + dy[i];
                        //次の探索先が壁ではなく、未訪問の時
                        if (walls[nextY][nextX].isHidden() && !search[nextY][nextX]) {
                            search[nextY][nextX] = true; //次の探索先を訪問済みにする
                            //現在地をルートに追加
                            route.push({ x: ptX, y: ptY, angle: i, num: pt.num });
                            que.push({ x: nextX, y: nextY, num: route.length - 1, cost: pt.cost + 1 });
                        }
                    }
                }
            }
            return undefined;
        };
        var juujiPush = function (x, y, cx, cy, sp) {
            var centerX = cx;
            var centerY = cy;
            var distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            if (distance < 20)
                return;
            isPush = true;
            var radian = Math.atan2(centerY - y, centerX - x);
            var degree = (radian * 180 / Math.PI) + 180;
            if (degree < 45) {
                sp.frameNumber = 1;
            }
            else if (degree < 135) {
                sp.frameNumber = 2;
            }
            else if (degree < 225) {
                sp.frameNumber = 3;
            }
            else if (degree < 315) {
                sp.frameNumber = 4;
            }
            else {
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
        var pointX = 0;
        var pointY = 0;
        var routes = [];
        var isMove = false;
        var bkX = 0;
        var bkY = 0;
        mapBase.pointDown.add(function (e) {
            bkX = wallBase.x;
            bkY = wallBase.y;
            var x = Math.floor(e.point.x / wallSize) * 2;
            var y = Math.floor(e.point.y / wallSize) * 2;
            setRoute(x, y);
        });
        mapBase.pointMove.add(function (e) {
            var xx = wallBase.x - bkX;
            var yy = wallBase.y - bkY;
            var x = Math.floor((e.point.x + e.startDelta.x - xx) / wallSize) * 2;
            var y = Math.floor((e.point.y + e.startDelta.y - yy) / wallSize) * 2;
            setRoute(x, y);
        });
        var setRoute = function (x, y) {
            if (pointX !== x || pointY !== y) {
                pointX = x;
                pointY = y;
                var r = seachMain(x, y); //経路を取得
                if (r) {
                    //経路を消す
                    if (routes) {
                        routes.forEach(function (p) {
                            maps[p.y][p.x].opacity = 0;
                            maps[p.y][p.x].modified();
                        });
                    }
                    routes = r;
                    //経路を描画
                    for (var i = 0; i < routes.length; i++) {
                        var p = routes[i];
                        maps[p.y][p.x].cssColor = "yellow";
                        if (i > 0) {
                            maps[p.y][p.x].opacity = 0.5;
                        }
                        else {
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
        var move2 = function () {
            if (isGoal || !scene.isStart)
                return;
            if (routes && routes.length >= 2) {
                isMove = true;
                var p_1 = routes.pop();
                maps[p_1.y][p_1.x].opacity = 0;
                maps[p_1.y][p_1.x].modified();
                player.setAngle(p_1.angle);
                p_1 = routes[routes.length - 1];
                var wall_1 = walls[p_1.y][p_1.x];
                console.log(p_1.x + " " + p_1.y + " " + p_1.angle);
                player.px = p_1.x;
                player.py = p_1.y;
                timeline.create(player, { modified: player.modified, destroyed: player.destroyed })
                    .moveTo(wall_1.x, wall_1.y, 250)
                    .con()
                    .every(function (a, b) {
                    wallBase.x = -player.x + (500 - 60) / 2;
                    wallBase.y = -player.y + (360 - 60) / 2;
                    wallBase.modified();
                    player.move();
                }, 250)
                    .call(function () {
                    player.px = p_1.x;
                    player.py = p_1.y;
                    toItem(wall_1);
                    toGoal();
                    move2();
                });
            }
            else {
                isMove = false;
            }
        };
        var animWallCnt = 0;
        _this.update.add(function () {
            if (!scene.isStart || isGoal)
                return;
            var _loop_1 = function (i) {
                if (animWallCnt < list2.length) {
                    var x_1 = list2[animWallCnt].x;
                    var y_1 = list2[animWallCnt].y;
                    walls[y_1][x_1].spr.hide();
                    if (!(player.px === x_1 && player.py === y_1) && !(goal.px === x_1 && goal.py === y_1)) {
                        if (list3.some(function (e) { return (e.x === x_1) && (e.y === y_1); })) {
                            walls[y_1][x_1].setItem(3);
                        }
                        else {
                            if (scene.random.get(0, 2) === 0) {
                                walls[y_1][x_1].setItem(scene.random.get(0, 2));
                            }
                        }
                    }
                    animWallCnt++;
                }
            };
            for (var i = 0; i < 4; i++) {
                _loop_1(i);
            }
            if (!isPush || isStop || !scene.isStart)
                return;
            move();
        });
        //画面タッチ(方向指定操作のとき)
        _this.pointDown.add(function (e) {
            if (!scene.isStart || isGoal)
                return;
            var x = e.point.x;
            var y = e.point.y;
            juujiPush(x, y, sizeW / 2, sizeH / 2, sprAngle);
        });
        _this.pointMove.add(function (e) {
            if (!scene.isStart || isGoal)
                return;
            var x = e.point.x + e.startDelta.x;
            var y = e.point.y + e.startDelta.y;
            juujiPush(x, y, sizeW / 2, sizeH / 2, sprAngle);
        });
        _this.pointUp.add(function (e) {
            if (!scene.isStart || isGoal)
                return;
            sprAngle.frameNumber = 0;
            isPush = false;
            sprAngle.modified();
        });
        //十字ボタンのイベント
        sprJuuji.pointDown.add(function (e) {
            if (!scene.isStart || isGoal)
                return;
            var x = e.point.x;
            var y = e.point.y;
            juujiPush(x, y, sprJuuji.width / 2, sprJuuji.height / 2, sprJuuji);
        });
        sprJuuji.pointMove.add(function (e) {
            if (!scene.isStart || isGoal)
                return;
            var x = e.point.x + e.startDelta.x;
            var y = e.point.y + e.startDelta.y;
            juujiPush(x, y, sprJuuji.width / 2, sprJuuji.height / 2, sprJuuji);
        });
        sprJuuji.pointUp.add(function (e) {
            if (!scene.isStart || isGoal)
                return;
            sprJuuji.frameNumber = 0;
            isPush = false;
            sprJuuji.modified();
        });
        //次のステージ
        var next = function () {
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
                for (var y = 0; y < mazeH; y++) {
                    for (var x = 0; x < mazeW; x++) {
                        maps[y][x].opacity = 0;
                        maps[y][x].modified();
                    }
                }
            }
            sprClear.hide();
            wallBase.moveTo(0, 0);
            wallBase.scale(0.5);
            var sx = [2, 2, 24, 24];
            var sy = [2, 16, 16, 2];
            var num = scene.random.get(0, 3);
            var wall = walls[sy[num]][sx[num]];
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
            timeline.create().wait(2500).call(function () {
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
        var isStop = false;
        _this.reset = function () {
            stage = 0;
            next();
        };
        return _this;
    }
    return MainGame;
}(g.E));
exports.MainGame = MainGame;
var Wall = /** @class */ (function (_super) {
    __extends(Wall, _super);
    function Wall(scene, x, y, w, h) {
        var _this = _super.call(this, { scene: scene, x: x, y: y }) || this;
        _this.num = 0;
        if (w === 10 && h === 10) {
            var spr = new g.Sprite({
                scene: scene,
                width: w,
                height: h,
                src: scene.assets["wall"]
            });
            _this.append(spr);
            _this.spr = spr;
        }
        else {
            var spr = new g.FilledRect({
                scene: scene,
                width: w,
                height: h,
                cssColor: "white"
            });
            _this.append(spr);
            _this.spr = spr;
        }
        var item;
        if (w === 70 && h === 70) {
            item = new g.FrameSprite({
                scene: scene,
                width: w,
                height: h,
                src: scene.assets["item"],
                frames: [0, 1, 2, 3]
            });
            _this.append(item);
            item.hide();
        }
        //アイテムをセット
        _this.setItem = function (num) {
            if (item !== undefined) {
                item.frameNumber = num;
                item.modified();
                item.show();
            }
        };
        //コインをゲット(消す)
        _this.getItem = function () {
            if (item !== undefined && !(item.state & 1 /* Hidden */)) {
                item.hide();
                return item.frameNumber;
            }
            return -1;
        };
        return _this;
    }
    Wall.prototype.isHidden = function () {
        return (this.spr.state & 1 /* Hidden */);
    };
    return Wall;
}(g.E));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(scene) {
        var _this = _super.call(this, {
            scene: scene,
            width: 70,
            height: 70
        }) || this;
        _this.px = 0;
        _this.py = 0;
        _this.angleNum = 0;
        var spr = new g.FrameSprite({
            scene: scene,
            src: scene.assets["player"],
            width: 70,
            height: 140,
            y: -80,
            frames: [0, 1, 2, 1]
        });
        var frameCnt = 0;
        var frameNum = 1;
        var angleNum = -1;
        _this.move = function () {
            if (frameCnt % 2 === 0) {
                frameNum = (frameNum + 1) % 4;
                spr.frameNumber = frameNum;
                spr.modified();
            }
            frameCnt++;
        };
        _this.append(spr);
        _this.setAngle = function (num) {
            if (num !== -1) {
                var framesBase = [0, 1, 2, 1];
                var frames_1 = [];
                for (var i = 0; i < 4; i++)
                    frames_1.push(framesBase[i] + num * 3);
                spr.frames = frames_1;
            }
            else {
                spr.frameNumber = 1;
                frameCnt = 0;
                frameNum = 1;
                spr.modified();
            }
            angleNum = num;
        };
        _this.setGoal = function () {
            spr.frames = [14];
            spr.frameNumber = 0;
            spr.modified();
        };
        return _this;
    }
    return Player;
}(g.E));
var Goal = /** @class */ (function (_super) {
    __extends(Goal, _super);
    function Goal(scene) {
        var _this = _super.call(this, {
            scene: scene,
            width: 70,
            height: 70
        }) || this;
        _this.px = 0;
        _this.py = 0;
        _this.angleNum = 0;
        var spr = new g.Sprite({
            scene: scene,
            src: scene.assets["player"],
            width: 70,
            height: 140,
            y: -80,
            srcX: 0,
            srcY: 280
        });
        _this.append(spr);
        return _this;
    }
    return Goal;
}(g.E));
