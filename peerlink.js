var fs = require('fs')
  , path = require('path')
  , EventEmitter = require('events').EventEmitter
  , saw = require('saw')
  , cp = require('cp')
  , mkdirp = require('mkdirp')
  , rimraf = require('rimraf')
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

exports.conf.addLink = function (links, moduleName, linkPath) {
  var found = false;
  links.forEach(function (link) {
    if (link.module === moduleName && link.path === linkPath) {
      found = true;
    }
  });
  if (!found) {
    links.push({module: moduleName, path: linkPath});
  }
};

exports.conf.removeLink = function (links, moduleName, linkPath) {
  var index = -1;
  links.forEach(function (link, i) {
    if (link.module === moduleName && link.path === linkPath) {
      index = i;
    }
  });
  if (index >= 0) {
    links.splice(index, 1);
  }
};

exports.conf.linkExists = function (links, moduleName, linkPath) {
  var exists = false;
  links.forEach(function (link, i) {
    if (link.module === moduleName && link.path === linkPath) {
      exists = true;
    }
  });
  return exists;
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
  return saw(path, {delay: 200, persistent: true})
    .on('all', function (ev, file) {
      if (!file.path.match(/\.git|node_modules/)) {
        exports.watch.emit('file:changed', name, path, ev, file);
      }
    });
};


/**
 * Linked modules.
 */
exports.links = new EventEmitter();

exports.links.update = function (old, updated) {
  old.forEach(function (link) {
    if (!exports.conf.linkExists(updated, link.module, link.path)) {
      exports.links.emit('remove', link.module, link.path);
    }
  });
  updated.forEach(function (link) {
    if (!exports.conf.linkExists(old, link.module, link.path)) {
      exports.links.emit('add', link.module, link.path);
    }
  });
};

/**
 * Deal with a changed file.
 */
exports.change = function (src, dest, ev, file) {
  if (ev === 'add') {
    if (file.stat.isDirectory()) {
      mkdirp.sync(path.join(dest, file.path));
    }
    else {
      mkdirp.sync(path.join(dest, file.parentDir));
      cp.sync(file.fullPath, path.join(dest, file.path));
    }
  }
  else if (ev === 'update') {
    if (file.stat.isFile()) {
      mkdirp.sync(path.join(dest, file.parentDir));
      cp.sync(file.fullPath, path.join(dest, file.path));
    }
  }
  else if (ev === 'remove') {
    rimraf.sync(path.join(dest, file.path));
  }
};


