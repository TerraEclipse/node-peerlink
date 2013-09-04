var fs = require('fs')
  , path = require('path')
  , EventEmitter = require('events').EventEmitter
  , saw = require('saw')
  , home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
  , confPath = path.resolve(home, '.peerlink.json');

/**
 * Configuration
 */
exports.conf = new EventEmitter();

exports.conf.load = function (cb) {
  fs.exists(confPath, function (exists) {
    if (exists) {
      fs.readFile(confPath, function (err, data) {
        if (err) return cb(err);
        try {
          var json = JSON.parse(data);
          cb(null, json);
        }
        catch (err) {
          return cb(err);
        }
      });
    }
    else {
      cb();
    }
  });
};

exports.conf.save = function (conf, cb) {
  fs.writeFile(confPath, JSON.stringify(conf, null, 2), function (err) {
    if (cb) cb(err);
  });
};

exports.conf.watch = function () {
  fs.watch(confPath, {persistent: true}, function (evt) {
    if (evt === 'change') {
      exports.conf.load(function (err, conf) {
        // We're specifically ignoring syntax errors here.
        // Only trigger onChange when there is new, VALID, configuration.
        if (err) {
          if (err.name !== 'SyntaxError') {
            return exports.conf.emit('error', err);
          }
        }
        if (conf) {
          exports.conf.emit('change', conf);
        }
      });
    }
  });
};

/**
 * Watching modules.
 */
exports.watch = new EventEmitter();

exports.watch.update = function (old, updated) {
  Object.keys(old).forEach(function (name) {
    if (!updated[name]) {
      exports.watch.emit('remove', name, old[name]);
    }
  });
  Object.keys(updated).forEach(function (name) {
    if (typeof old[name] === 'undefined') {
      exports.watch.emit('add', name, updated[name]);
    }
    else if (old[name] !== updated[name]) {
      exports.watch.emit('change', name, updated[name]);
    }
  });
};

exports.watch.create = function (name, path) {
  return saw(path, {delay: 100, persistent: true})
    .on('all', function (ev, file) {
      exports.watch.emit('files:changed', name, path, ev, file);
    });
};


/**
 * Linked modules.
 */
exports.links = new EventEmitter();

exports.links.update = function (old, updated) {
  Object.keys(old).forEach(function (name) {
    if (!updated[name]) {
      exports.links.emit('remove', name, old[name]);
    }
  });
  Object.keys(updated).forEach(function (name) {
    if (typeof old[name] === 'undefined') {
      exports.links.emit('add', name, updated[name]);
    }
    else if (old[name] !== updated[name]) {
      exports.links.emit('change', name, updated[name]);
    }
  });
};


