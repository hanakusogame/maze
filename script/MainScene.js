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
var MainGame_1 = require("./MainGame");
var Config_1 = require("./Config");
var Button_1 = require("./Button");
/* tslint:disable: align */
var MainScene = /** @class */ (function (_super) {
    __extends(MainScene, _super);
    function MainScene(param) {
        var _this = this;
        param.assetIds = [
            "img_numbers_n", "img_numbers_n_red", "title", "start", "finish", "score", "time",
            "block", "waku", "ball", "player", "wakuf", "clear", "waku", "juuji", "wall", "angle", "item", "select", "cursor",
            "config", "volume", "test", "glyph72", "number_w", "number_b", "number_p",
            "se_start", "se_timeup", "bgm", "se_clear", "se_move", "se_up", "se_finish", "se_shot", "se_miss"
        ];
        _this = _super.call(this, param) || this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(_this);
        var timeline2 = new tl.Timeline(_this);
        var isDebug = false;
        _this.loaded.add(function () {
            g.game.vars.gameState = { score: 0 };
            // 何も送られてこない時は、標準の乱数生成器を使う
            _this.random = g.game.random;
            _this.message.add(function (msg) {
                if (msg.data && msg.data.type === "start" && msg.data.parameters) {
                    var sessionParameters = msg.data.parameters;
                    if (sessionParameters.randomSeed != null) {
                        // プレイヤー間で共通の乱数生成器を生成
                        // `g.XorshiftRandomGenerator` は Akashic Engine の提供する乱数生成器実装で、 `g.game.random` と同じ型。
                        _this.random = new g.XorshiftRandomGenerator(sessionParameters.randomSeed);
                    }
                }
            });
            // 配信者のIDを取得
            _this.lastJoinedPlayerId = "";
            g.game.join.add(function (ev) {
                _this.lastJoinedPlayerId = ev.player.id;
            });
            // 背景
            var bg = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "#303030", opacity: 0 });
            _this.append(bg);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                bg.opacity = 1.0;
                bg.modified();
            }
            var base = new g.E({ scene: _this });
            _this.append(base);
            base.hide();
            var uiBase = new g.E({ scene: _this });
            _this.append(uiBase);
            uiBase.hide();
            //タイトル
            var sprTitle = new g.Sprite({ scene: _this, src: _this.assets["title"], x: 70 });
            _this.append(sprTitle);
            timeline.create(sprTitle, {
                modified: sprTitle.modified, destroyd: sprTitle.destroyed
            }).wait((isDebug) ? 1000 : 5000).moveBy(-800, 0, 200).call(function () {
                bg.show();
                base.show();
                uiBase.show();
                _this.isStart = true;
                reset();
            });
            //操作方法選択
            var sprSelect = new g.Sprite({ scene: _this, src: _this.assets["select"], x: 0, y: 210 });
            sprTitle.append(sprSelect);
            var sprCursors = [];
            var _loop_1 = function (i) {
                var sprCursor = new g.Sprite({ scene: _this, src: _this.assets["cursor"], x: 98 + (117 * i), y: 0, touchable: true });
                sprSelect.append(sprCursor);
                sprCursor.pointDown.add(function () {
                    sprCursors.forEach(function (e) {
                        e.opacity = 0;
                        e.modified();
                    });
                    sprCursor.opacity = 1;
                    sprCursor.show();
                    game.setMode(i);
                });
                sprCursors.push(sprCursor);
                if (i !== 0) {
                    sprCursor.opacity = 0;
                    sprCursor.modified();
                }
            };
            for (var i = 0; i < 3; i++) {
                _loop_1(i);
            }
            var glyph = JSON.parse(_this.assets["test"].data);
            var numFont = new g.BitmapFont({
                src: _this.assets["img_numbers_n"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            var numFontRed = new g.BitmapFont({
                src: _this.assets["img_numbers_n_red"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            glyph = JSON.parse(_this.assets["glyph72"].data);
            var numFontW = new g.BitmapFont({
                src: _this.assets["number_w"],
                map: glyph.map,
                defaultGlyphWidth: 65,
                defaultGlyphHeight: 80
            });
            glyph = JSON.parse(_this.assets["glyph72"].data);
            var numFontB = new g.BitmapFont({
                src: _this.assets["number_b"],
                map: glyph.map,
                defaultGlyphWidth: 72,
                defaultGlyphHeight: 80
            });
            glyph = JSON.parse(_this.assets["glyph72"].data);
            var numFontP = new g.BitmapFont({
                src: _this.assets["number_p"],
                map: glyph.map,
                defaultGlyphWidth: 72,
                defaultGlyphHeight: 80
            });
            //ステージ
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["score"], x: 505, y: 45, height: 32, srcY: 32 }));
            var stage = 0;
            var labelStage = new g.Label({
                scene: _this,
                x: 605,
                y: 45,
                width: 32 * 1,
                fontSize: 32,
                font: numFont,
                text: "0",
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelStage);
            //スコア
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["score"], x: 505, y: 85, height: 32 }));
            var score = 0;
            var labelScore = new g.Label({
                scene: _this,
                x: 320,
                y: 120,
                width: 32 * 10,
                fontSize: 32,
                font: numFont,
                text: "0",
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelScore);
            var labelScorePlus = new g.Label({
                scene: _this,
                x: 312,
                y: 160,
                width: 32 * 10,
                fontSize: 32,
                font: numFontRed,
                text: "+0",
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            uiBase.append(labelScorePlus);
            //タイム
            uiBase.append(new g.Sprite({ scene: _this, src: _this.assets["time"], x: 540, y: 320 }));
            var labelTime = new g.Label({ scene: _this, font: numFont, fontSize: 32, text: "70", x: 580, y: 323 });
            uiBase.append(labelTime);
            //開始
            var sprStart = new g.Sprite({ scene: _this, src: _this.assets["start"], x: 50, y: 100 });
            uiBase.append(sprStart);
            sprStart.hide();
            //終了
            var finishBase = new g.E({ scene: _this, x: 0, y: 0 });
            _this.append(finishBase);
            finishBase.hide();
            var finishBg = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "#000000", opacity: 0.3 });
            finishBase.append(finishBg);
            var sprFinish = new g.Sprite({ scene: _this, src: _this.assets["finish"], x: 120, y: 100 });
            finishBase.append(sprFinish);
            //最前面
            var fg = new g.FilledRect({ scene: _this, width: 640, height: 360, cssColor: "#ff0000", opacity: 0.0 });
            _this.append(fg);
            //リセットボタン
            var btnReset = new Button_1.Button(_this, ["リセット"], 500, 270, 130);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                finishBase.append(btnReset);
                btnReset.pushEvent = function () {
                    reset();
                };
            }
            //ランキングボタン
            var btnRanking = new Button_1.Button(_this, ["ランキング"], 500, 200, 130);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                finishBase.append(btnRanking);
                btnRanking.pushEvent = function () {
                    window.RPGAtsumaru.experimental.scoreboards.display(1);
                };
            }
            //設定ボタン
            var btnConfig = new g.Sprite({ scene: _this, x: 600, y: 0, src: _this.assets["config"], touchable: true });
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                _this.append(btnConfig);
            }
            //設定画面
            var config = new Config_1.Config(_this, 380, 40);
            if ((typeof window !== "undefined" && window.RPGAtsumaru) || isDebug) {
                _this.append(config);
            }
            config.hide();
            btnConfig.pointDown.add(function () {
                if (config.state & 1) {
                    config.show();
                }
                else {
                    config.hide();
                }
            });
            config.bgmEvent = function (num) {
                bgm.changeVolume(0.5 * num);
            };
            config.colorEvent = function (str) {
                bg.cssColor = str;
                bg.modified();
            };
            var bgm = _this.assets["bgm"].play();
            bgm.changeVolume(isDebug ? 0.0 : 0.2);
            _this.playSound = function (name) {
                _this.assets[name].play().changeVolume(config.volumes[1]);
            };
            //ゲームメイン
            var game = new MainGame_1.MainGame(_this);
            base.append(game);
            //メインループ
            var bkTime = 0;
            var timeLimit = 70;
            var startTime = 0;
            _this.update.add(function () {
                //return;//デバッグ
                if (!_this.isStart)
                    return;
                var t = timeLimit - Math.floor((Date.now() - startTime) / 1000);
                //終了処理
                if (t <= -1) {
                    fg.cssColor = "#000000";
                    fg.opacity = 0.0;
                    fg.modified();
                    finishBase.show();
                    _this.isStart = false;
                    _this.playSound("se_timeup");
                    timeline.create().wait(1500).call(function () {
                        if (typeof window !== "undefined" && window.RPGAtsumaru) {
                            window.RPGAtsumaru.experimental.scoreboards.setRecord(1, g.game.vars.gameState.score).then(function () {
                                btnRanking.show();
                                btnReset.show();
                            });
                        }
                        if (isDebug) {
                            btnRanking.show();
                            btnReset.show();
                        }
                    });
                    return;
                }
                labelTime.text = "" + t;
                labelTime.invalidate();
                if (bkTime !== t && t <= 5) {
                    fg.opacity = 0.1;
                    fg.modified();
                    timeline.create().wait(500).call(function () {
                        fg.opacity = 0.0;
                        fg.modified();
                    });
                }
                bkTime = t;
            });
            //スコア加算表示
            var bkTweenScore;
            _this.addScore = function (num) {
                if (score + num < 0) {
                    num = -score;
                }
                score += num;
                timeline.create().every(function (e, p) {
                    labelScore.text = "" + (score - Math.floor(num * (1 - p)));
                    labelScore.invalidate();
                }, 500);
                labelScorePlus.text = "+" + num;
                labelScorePlus.invalidate();
                if (bkTweenScore)
                    timeline2.remove(bkTweenScore);
                bkTweenScore = timeline2.create().every(function (e, p) {
                    labelScorePlus.opacity = p;
                    labelScorePlus.modified();
                }, 100).wait(4000).call(function () {
                    labelScorePlus.opacity = 0;
                    labelScorePlus.modified();
                });
                g.game.vars.gameState.score = score;
            };
            _this.setStage = function (num) {
                stage = num;
                labelStage.text = "" + stage;
                labelStage.invalidate();
            };
            //リセット
            var reset = function () {
                bkTime = 0;
                startTime = Date.now();
                _this.isStart = true;
                score = 0;
                labelScore.text = "0";
                labelScore.invalidate();
                labelScorePlus.text = "";
                labelScorePlus.invalidate();
                _this.setStage(1);
                sprStart.show();
                timeline.create().wait(750).call(function () {
                    sprStart.hide();
                });
                btnReset.hide();
                btnRanking.hide();
                fg.opacity = 0;
                fg.modified();
                finishBase.hide();
                startTime = Date.now();
                game.reset();
                _this.playSound("se_start");
            };
        });
        return _this;
    }
    return MainScene;
}(g.Scene));
exports.MainScene = MainScene;
