var AudioClipMeta = Fire.define('Fire.AudioClipMeta', Fire.AssetMeta);
AudioClipMeta.prop('binary', false);

AudioClipMeta.prototype.importer = Fire.AudioClipImporter;

module.exports = AudioClipMeta;
