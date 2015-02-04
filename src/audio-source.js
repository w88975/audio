
var AudioSource = (function () {
    var AudioSource = Fire.define("Fire.AudioSource", Fire.Component, function () {
        Fire.AudioContext.initSource(this);
        this._time = 0;
        this._play = false; //-- 声源暂停或者停止时候为false
        this._pause = false;//-- 来区分声源是暂停还是停止
        this.onEnd = null;
    });

    //-- 增加 Audio Sources 到 组件菜单上
    Fire.addComponentMenu(AudioSource, 'AudioSource');

    //-- 返回当前播放的状态
    AudioSource.get("isPlaying", function () {
        return this._play && !this._pause;
    }, Fire.HideInInspector);   

    //-- 当前时间
    Object.defineProperty(AudioSource.prototype, 'time', {
        get: function () {
            this._time = Fire.AudioContext.getCurrentTime(this);
            return this._time;
        },
        set: function (value) {
            if (this._time != value) {
                this._time = value;
                Fire.AudioContext.updateTime(this);
                if (this._play) {
                    this.stop(false);
                    this.play();
                }
            }
        }
    });

    //-- 当前音频剪辑
    AudioSource.prop('_clip', null, Fire.HideInInspector);
    AudioSource.getset('clip',
        function () {
            return this._clip;
        },
        function (value) {
            if (this._clip !== value) {
                this._clip = value;
                Fire.AudioContext.updateAudioClip(this);
            }
        },
        Fire.ObjectType(Fire.AudioClip)
    );

    //-- 是否循环
    AudioSource.prop('_loop', false, Fire.HideInInspector);
    AudioSource.getset('loop',
       function () {
           return this._loop;
       },
       function (value) {
           if (this._loop !== value) {
               this._loop = value;
               Fire.AudioContext.updateLoop(this);
           }
       }
    );

    //-- 是否禁音
    AudioSource.prop('_mute', false, Fire.HideInInspector);
    AudioSource.getset('mute',
       function () {
           return this._mute;
       },
       function (value) {
           if (this._mute !== value) {
               this._mute = value;
               Fire.AudioContext.updateMute(this);
           }
       }
    );

    //-- 音量大小
    AudioSource.prop('_volume', 1, Fire.HideInInspector);
    AudioSource.getset('volume',
       function () {
           return this._volume;
       },
       function (value) {
           if (this._volume !== value) {
               this._volume = Math.clamp(value);
               Fire.AudioContext.updateVolume(this);
           }
       },
       Fire.Range(0,1)
    );

    //-- 是否立即播放
    AudioSource.prop('playOnAwake', true);

    //-- 播放结束以后的回调
    AudioSource.prototype.onPlayEnd = function () {
        if (this._pause) {
            return;
        }
        if (this.onEnd) {
            this.onEnd();
        }
        this._play = false;
        this._pause = false;
    };

    AudioSource.prototype.pause = function () {
        this._pause = true;
        Fire.AudioContext.pause(this);
    };

    AudioSource.prototype.play = function () {
        Fire.AudioContext.play(this);
        this._play = true;
        this._pause = false;
    };

    AudioSource.prototype.stop = function (isAutoStop) {
        var autoStop = isAutoStop != null ? isAutoStop : true;
        Fire.AudioContext.stop(this, autoStop);
        this._play = false;
        this._pause = false;
    };

    AudioSource.prototype.onLoad = function () {
        if (!Fire.Engine.isPlaying && this._play) {
            this.stop();
        }
    };

    AudioSource.prototype.onStart = function () {
        //if (this.playOnAwake) {
        //    console.log("onStart");
        //    this.play();
        //}
    };

    AudioSource.prototype.onEnable = function () {
        if (this.playOnAwake && Fire.Engine.isPlaying) {
            this.play();
        }
    };

    AudioSource.prototype.onDisable = function () {
        if (this._play) {
            this.stop();
        }
    };

    return AudioSource;
})();

Fire.AudioSource = AudioSource;
