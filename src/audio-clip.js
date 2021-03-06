﻿Fire.AudioClip = (function () {
    var AudioClip = Fire.define("Fire.AudioClip", Fire.Asset, null);

    AudioClip.prop('rawData', null, Fire.RawType('audio'));

    AudioClip.get('buffer', function () {
        return Fire.AudioContext.getClipBuffer(this);
    });

    AudioClip.get("length", function () {
        return Fire.AudioContext.getClipLength(this);
    });

    AudioClip.get("samples", function () {
        return Fire.AudioContext.getClipSamples(this);
    });

    AudioClip.get("channels", function () {
        return Fire.AudioContext.getClipChannels(this);
    });

    AudioClip.get("frequency", function () {
        return Fire.AudioContext.getClipFrequency(this);
    });

    return AudioClip;
})();

// create entity action
// @if EDITOR
Fire.AudioClip.prototype.createEntity = function () {
    var ent = new Fire.Entity(this.name);

    var audioSource = ent.addComponent(Fire.AudioSource);

    audioSource.clip = this;

    return ent;
};
// @endif
