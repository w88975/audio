(function () {
    var UseWebAudio = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
    var webAudio = null;
    if (!UseWebAudio) {
        return;
    }
    var AudioContext = {};

    function loader (url, callback, onProgress) {
        var cb = callback && function (xhr, error) {
            if (xhr) {
                if (!webAudio) {
                    webAudio = new UseWebAudio();
                }
                webAudio.decodeAudioData(xhr.response, function (buffer) {
                    callback(buffer);
                },function (e) {
                    callback(null, 'LoadAudioClip: "' + url +
                    '" seems to be unreachable or the file is empty. InnerMessage: ' + e);
                });
            }
            else {
                callback(null, 'LoadAudioClip: "' + url +
               '" seems to be unreachable or the file is empty. InnerMessage: ' + error);
            }
        };
        Fire.LoadManager._loadFromXHR(url, cb, onProgress, 'arraybuffer');
    }

    Fire.LoadManager.registerRawTypes('audio', loader);
    
    AudioContext.initSource = function (target) {
        target._startOffset = 0;
        target._startTime = 0;
        target._curTime = 0;
        target._buffSource = null;
        target._volumeGain = null;
    };

    AudioContext.getBuffSource = function (target) {
        if (!target._buffSource) {
            target._buffSource = webAudio.createBufferSource();
        }
        return target._buffSource;
    };

    AudioContext.getVolumeGain = function (target) {
        if (!target._volumeGain) {
            target._volumeGain = webAudio.createGain();
        }
        return target._volumeGain;
    };

    AudioContext.getCurrentTime = function (target) {
        if (target) {
            var source = this.getBuffSource(target);
            var buffer = source.buffer;
            if (target._pause) {
                return target._startOffset % buffer.duration;
            }
            else if (target._play) {
                var loadedTime = webAudio.currentTime;
                var curTime = target._startOffset + loadedTime - target._startTime;
                var duration = buffer.duration;
                curTime = curTime >= duration ? duration : curTime;
                return curTime;
            }
        }
        else {
            return target._time;
        }
    };

    AudioContext.updateTime = function (target) {
        // 当前时间就等于 audio source 的 _time
        if (target) {
            var source = this.getBuffSource(target);
            var duration = source.buffer.duration;
            if (target._time > duration) {
                target._time = duration;
            }
            target._curTime = target._time;
            target._startOffset = target._curTime;
        }
    };

    // 静音
    AudioContext.updateMute = function (target) {
        if (!target || !target._volumeGain) { return; }
        target._volumeGain.gain.value = target.mute ? -1 : this.updateVolume(target);
    };
    
    // 设置音量，音量范围是[0, 1]
    AudioContext.updateVolume = function (target) {
        if (!target || !target._volumeGain) { return; }
        target._volumeGain.gain.value = (target.volume - 1);
    };
    
    // 设置循环
    AudioContext.updateLoop = function (target) {
        if (!target) { return; }
        var source = this.getBuffSource(target);
        source.loop = target.loop;
    };
    
    // 将音乐源节点绑定具体的音频buffer
    AudioContext.updateAudioClip = function (target) {
        if (!target) { return; }
        var source = this.getBuffSource(target);
        source.buffer = target.clip.rawData;
    };

    // 暂停
    AudioContext.pause = function (target) {
        this.stop(target, true);
    };

    // 停止
    AudioContext.stop = function (target, autoStop) {
        if (!target || !target._buffSource) { return; }
        if (!autoStop) {
            target._buffSource.onended = null;
        }
        else {
            if (target._pause) {
                target._startOffset += webAudio.currentTime - target._startTime;
            }
            else {
                target._startOffset = 0;
            }
        }
        target._buffSource.stop();
    };

    // 播放
    AudioContext.play = function (target) {
        if (!target.clip || !target.clip.rawData) { return; }
        if (target._play && !target._pause) { return; }
        // 初始化
        target._buffSource = null;
        target._volumeGain = null;
        // 创建音频源节点
        var bufsrc = webAudio.createBufferSource();
        // 控制音量的节点
        var gain = webAudio.createGain();
        // source节点先连接到对音量控制的volume增益节点上
        bufsrc.connect(gain);
        // volume增益节点再连接到最终的输出设备上
        gain.connect(webAudio.destination);
        // 将音频源与硬件连接
        bufsrc.connect(webAudio.destination);
        target._buffSource = bufsrc;
        target._volumeGain = gain;
        // 设置开始播放时间
        target._startTime = webAudio.currentTime;
        // 将音乐源节点绑定具体的音频buffer
        this.updateAudioClip(target);
        // 设置音量，音量范围是[0, 1]
        this.updateVolume(target);
        // 是否禁音
        this.updateMute(target);
        // 是否循环播放
        this.updateLoop(target);
        // 播放音乐
        if (target._pause && target._curTime === 0) {
            var buffer = target._buffSource.buffer;
            target._buffSource.start(0, target._startOffset % buffer.duration);
        }
        else {
            target._buffSource.start(0, target._curTime);
        }
        target._curTime = 0;
        // 播放结束后的回调
        target._buffSource.onended = target.onPlayEnd.bind(target);
    };

    // 创建buff Source
    function _createBufferSource(clip) {
        var buffSource = webAudio.createBufferSource();
        buffSource.buffer = clip.rawData;
        return buffSource.buffer;
    }

    // 获得音频剪辑的 buffer
    AudioContext.getClipBuffer = function (clip) {
        return clip.rawData;
    };

    // 以秒为单位 获取音频剪辑的 长度
    AudioContext.getClipLength = function (clip) {
        if (!clip) {
            return;
        }
        var buffer = _createBufferSource(clip);
        return buffer.duration;
    };

    // 音频剪辑的长度
    AudioContext.getClipSamples = function (clip) {
        if (!clip) {
            return;
        }
        var buffer = _createBufferSource(clip);
        return buffer.length;
    };

    // 音频剪辑的声道数
    AudioContext.getClipChannels = function (clip) {
        if (!clip) {
            return;
        }
        var buffer = _createBufferSource(clip);
        return buffer.numberOfChannels;
    };

    // 音频剪辑的采样频率
    AudioContext.getClipFrequency = function (clip) {
        if (!clip) {
            return;
        }
        var buffer = _createBufferSource(clip);
        return buffer.sampleRate;
    };


    Fire.AudioContext = AudioContext;
})();
