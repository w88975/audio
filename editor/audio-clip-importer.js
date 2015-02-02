var Path = require('fire-path');

var AudioClipImporter = Fire.define('Fire.AudioClipImporter', Fire.AssetImporter);

AudioClipImporter.prototype.exec = function (file) {
    var audioClip = file.asset;
    var extname = Path.extname(file.path);
    if (!audioClip) {
        // load Fire.AudioClip
        require('../src/audio-clip');
        audioClip = new Fire.AudioClip();
        audioClip._setRawExtname(extname);
    }
    var process = 2;

    Fire.AssetDB.saveAssetToLibrary(file.meta.uuid, file.path, audioClip, function (err) {
        if (err) {
            Fire.error(err.message);
            return;
        }

        --process;
        if (process === 0) this.done();
    }.bind(this));

    Fire.AssetDB.copyToLibrary(file.meta.uuid, extname, file.path, function (err) {
        if (err) {
            Fire.error(err.message);
        }

        --process;
        if (process === 0) this.done();
    }.bind(this));
};

module.exports = AudioClipImporter;
