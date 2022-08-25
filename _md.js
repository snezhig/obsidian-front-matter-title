, TA = function(t) {
    function e(e, n) {
        var i = t.call(this) || this;
        return i.worker = null,
            i.inProgressTaskCount = 0,
            i.db = null,
            i.fileCache = {},
            i.metadataCache = {},
            i.workQueue = new Wh,
            i.uniqueFileLookup = new kt,
            i.initialized = !1,
            i.resolvedLinks = {},
            i.unresolvedLinks = {},
            i.linkResolverQueue = null,
            i.onCleanCacheCallbacks = [],
            i.workerResolve = null,
            i.userIgnoreFilters = null,
            i.userIgnoreFiltersString = "",
            i.userIgnoreFilterCache = {},
            i.app = e,
            i.vault = n,
            i.worker = new Worker("worker.js",{
                name: "Metadata Cache Worker"
            }),
            i.worker.onmessage = i.onReceiveMessageFromWorker.bind(i),
            i.blockCache = new MA(e),
            i.linkResolver(),
            i.on("finished", i.checkCleanCache, i),
            i.on("resolved", i.checkCleanCache, i),
            i
    }
    return M(e, t),
        e.prototype.getLinkSuggestions = function() {
            for (var t = [], e = {}, n = this.unresolvedLinks, i = this.vault, r = i.getConfig("showUnsupportedFiles"), o = 0, s = i.getFiles(); o < s.length; o++) {
                var a = s[o];
                if (r || Yt(a.extension)) {
                    var l = a.path;
                    "md" === a.extension && (l = Wt(l)),
                        e[l] = !0,
                        t.push({
                            file: a,
                            path: l
                        });
                    var c = this.getFileCache(a);
                    if (c) {
                        var u = Zg(c.frontmatter);
                        if (u)
                            for (var h = 0, p = u; h < p.length; h++) {
                                var f = p[h];
                                t.push({
                                    file: a,
                                    path: l,
                                    alias: f
                                })
                            }
                    }
                }
            }
            for (var d in n)
                if (n.hasOwnProperty(d)) {
                    var g = n[d];
                    for (var m in g)
                        g.hasOwnProperty(m) && (m.length > 500 && (m = m.substring(0, 500)),
                        e[m] || (e[m] = !0,
                            t.push({
                                file: null,
                                path: m
                            })))
                }
            return t
        }
        ,
        e.prototype.getTags = function() {
            var t = this.fileCache
                , e = this.metadataCache
                , n = {}
                , i = function(t) {
                if (t) {
                    var e = t.split("/").last();
                    n[t] = (n[t] || 0) + 1,
                    e !== t && i(t.substr(0, t.length - e.length - 1))
                }
            };
            for (var r in t)
                if (t.hasOwnProperty(r)) {
                    var o = e[t[r].hash];
                    if (o) {
                        var s = nA(o);
                        if (s)
                            for (var a = 0, l = s; a < l.length; a++) {
                                var c = l[a];
                                i(c)
                            }
                    }
                }
            var u = {};
            for (var c in n)
                if (n.hasOwnProperty(c)) {
                    var h = c.toLowerCase()
                        , p = n[c];
                    if (u.hasOwnProperty(h)) {
                        var f = u[h];
                        f.count += p,
                        p > f.max && (f.max = p,
                            f.tag = c)
                    } else
                        u[h] = {
                            tag: c,
                            count: p,
                            max: p
                        }
                }
            for (var c in n = {},
                u)
                if (u.hasOwnProperty(c)) {
                    var d = u[c];
                    n[d.tag] = d.count
                }
            return n
        }
        ,
        e.prototype.getLinkpathDest = function(t, e) {
            if ("" === t && e) {
                var n = this.vault.getAbstractFileByPath(e);
                if (n instanceof gw)
                    return [n]
            }
            var i = this._getLinkpathDest(t, e);
            return 0 === i.length && (i = this._getLinkpathDest(t + ".md", e)),
                i
        }
        ,
        e.prototype.getFirstLinkpathDest = function(t, e) {
            var n = this.getLinkpathDest(t, e);
            return n.length > 0 ? n[0] : null
        }
        ,
        e.prototype._getLinkpathDest = function(t, e) {
            var n = t.toLowerCase()
                , i = qt(n)
                , r = this.uniqueFileLookup.get(i);
            if (!r)
                return [];
            var o = Ut(e).toLowerCase();
            if (n.startsWith("./") || n.startsWith("../")) {
                if (n.startsWith("./../") && (n = n.substr(2)),
                    n.startsWith("./"))
                    "" !== o && (o += "/"),
                        n = o + n.substring(2);
                else {
                    for (; n.startsWith("../"); )
                        n = n.substr(3),
                            o = Ut(o);
                    "" !== o && (o += "/"),
                        n = o + n
                }
                for (var s = 0, a = r; s < a.length; s++) {
                    if ((g = (d = a[s]).path.toLowerCase()) === n)
                        return [d]
                }
            }
            n.startsWith("/") && (n = n.substr(1));
            for (var l = 0, c = r; l < c.length; l++) {
                if ((g = (d = c[l]).path.toLowerCase()) === n)
                    return [d]
            }
            if (t.startsWith("/"))
                return [];
            for (var u = [], h = [], p = 0, f = r; p < f.length; p++) {
                var d, g;
                (g = (d = f[p]).path.toLowerCase()).endsWith(n) && (g.startsWith(o) ? u.push(d) : h.push(d))
            }
            return u.sort((function(t, e) {
                    return t.path.length - e.path.length
                }
            )),
                h.sort((function(t, e) {
                        return t.path.length - e.path.length
                    }
                )),
                u.concat(h)
        }
        ,
        e.prototype.getLinks = function() {
            var t = {};
            for (var e in this.fileCache)
                if (this.fileCache.hasOwnProperty(e)) {
                    var n = []
                        , i = this.fileCache[e].hash
                        , r = this.metadataCache[i];
                    r && (r.links && (n = n.concat(r.links)),
                    r.embeds && (n = n.concat(r.embeds))),
                        t[e] = n
                }
            return t
        }
        ,
        e.prototype.getFileCache = function(t) {
            return this.getCache(t.path)
        }
        ,
        e.prototype.getCache = function(t) {
            if (!this.fileCache.hasOwnProperty(t))
                return null;
            if ("md" !== Gt(qt(t)))
                return {};
            var e = this.fileCache[t].hash;
            return this.metadataCache[e] || null
        }
        ,
        e.prototype.getFileInfo = function(t) {
            return this.fileCache[t]
        }
        ,
        e.prototype.getCachedFiles = function() {
            return Object.keys(this.fileCache)
        }
        ,
        e.prototype.iterateReferences = function(t) {
            var e = function(e) {
                if (!n.fileCache.hasOwnProperty(e))
                    return "continue";
                var i = n.fileCache[e].hash;
                tA(n.metadataCache[i], (function(n) {
                        return t(e, n)
                    }
                ))
            }
                , n = this;
            for (var i in this.fileCache)
                e(i)
        }
        ,
        e.prototype.getBacklinksForFile = function(t) {
            var e = this
                , n = new kt;
            return this.iterateReferences((function(i, r) {
                    var o = QD(r.link)
                        , s = e.getFirstLinkpathDest(o, i);
                    s && s === t && n.add(i, r)
                }
            )),
                n
        }
        ,
        e.prototype.fileToLinktext = function(t, e, n) {
            void 0 === n && (n = !0);
            var i = this.vault.getConfig("newLinkFormat")
                , r = "md" === t.extension && n ? Wt(t.path) : t.path;
            if ("absolute" === i)
                return r;
            if ("relative" === i) {
                for (var o = "", s = Ut(e); "" !== s && "/" !== s && 0 !== r.indexOf(s + "/"); )
                    o = "../" + o,
                        s = Ut(s);
                return 0 === r.indexOf(s + "/") ? o + r.substr(s.length + 1) : o + r
            }
            var a = "md" === t.extension && n ? t.basename : t.name
                , l = QD(a)
                , c = this.getLinkpathDest(l, e);
            return c && 1 === c.length && c[0] === t ? a : "md" === t.extension && n ? Wt(t.path) : t.path
        }
        ,
        e.prototype.watchVaultChanges = function() {
            var t = this.vault;
            t.on("create", this.onCreate.bind(this)),
                t.on("modify", this.onCreateOrModify.bind(this)),
                t.on("delete", this.onDelete.bind(this)),
                t.on("rename", this.onRename.bind(this)),
                t.on("config-changed", this.updateUserIgnoreFilters.bind(this))
        }
        ,
        e.prototype.initialize = function() {
            return L(this, void 0, void 0, (function() {
                    var t, e, n, i, r, o, s, a, l, c, u, h, p, f, d, g, m, v;
                    return D(this, (function(y) {
                            switch (y.label) {
                                case 0:
                                    e = (t = this).fileCache,
                                        n = t.metadataCache,
                                        y.label = 1;
                                case 1:
                                    return y.trys.push([1, 8, , 9]),
                                        i = this,
                                        [4, yA(this.app.appId + "-cache", 19, {
                                            upgrade: function(t, e, n, i) {
                                                t.objectStoreNames.contains("file") && t.deleteObjectStore("file"),
                                                t.objectStoreNames.contains("metadata") && t.deleteObjectStore("metadata"),
                                                    t.createObjectStore("file"),
                                                    t.createObjectStore("metadata")
                                            }
                                        })];
                                case 2:
                                    return [4, (i.db = y.sent()).transaction(["file", "metadata"])];
                                case 3:
                                    return [4, (r = y.sent()).objectStore("file").getAllKeys()];
                                case 4:
                                    return o = y.sent(),
                                        [4, r.objectStore("file").getAll()];
                                case 5:
                                    for (s = y.sent(),
                                             c = 0; c < o.length; c++)
                                        e[o[c]] = s[c];
                                    return [4, r.objectStore("metadata").getAllKeys()];
                                case 6:
                                    return a = y.sent(),
                                        [4, r.objectStore("metadata").getAll()];
                                case 7:
                                    for (l = y.sent(),
                                             c = 0; c < a.length; c++)
                                        n[a[c]] = $D(l[c], JD);
                                    return [3, 9];
                                case 8:
                                    return u = y.sent(),
                                        console.error("Failed to load cache", u),
                                        [3, 9];
                                case 9:
                                    for (setInterval(this.cleanupDeletedCache.bind(this), 6e5),
                                             h = {},
                                             p = this.vault.getAllLoadedFiles(),
                                             f = 0,
                                             d = p; f < d.length; f++)
                                        (v = d[f])instanceof gw && (this.uniqueFileLookup.add(v.name.toLowerCase(), v),
                                            h[v.path] = v);
                                    for (m in e)
                                        e.hasOwnProperty(m) && (v = h[m],
                                            g = e[m],
                                            v ? n.hasOwnProperty(g.hash) ? (Mb.isAndroidApp && v.stat.mtime !== g.mtime && g.mtime % 1e3 == 0 && 1e3 * Math.floor(v.stat.mtime / 1e3) === g.mtime && (g.mtime = v.stat.mtime,
                                                this.saveFileCache(m, g)),
                                                v.stat.mtime !== g.mtime || v.stat.size !== g.size ? this.onCreateOrModify(v) : this.linkResolverQueue.add(v)) : this.onCreateOrModify(v) : this.deletePath(m));
                                    for (m in h)
                                        h.hasOwnProperty(m) && (v = h[m],
                                        e[m] || this.onCreateOrModify(v));
                                    return this.initialized = !0,
                                        this.watchVaultChanges(),
                                        this.cleanupDeletedCache(),
                                        this.updateUserIgnoreFilters(),
                                        this.trigger("initialized"),
                                        this.trigger("finished"),
                                        [2]
                            }
                        }
                    ))
                }
            ))
        }
        ,
        e.prototype.clear = function() {
            return L(this, void 0, void 0, (function() {
                    var t;
                    return D(this, (function(e) {
                            switch (e.label) {
                                case 0:
                                    return (t = this.db) ? [4, t.clear("metadata")] : [3, 3];
                                case 1:
                                    return e.sent(),
                                        [4, t.clear("file")];
                                case 2:
                                    e.sent(),
                                        e.label = 3;
                                case 3:
                                    return [2]
                            }
                        }
                    ))
                }
            ))
        }
        ,
        e.prototype.showIndexingNotice = function() {
            var t, e, n = this, i = ye("interface.msg-indexing"), r = this.inProgressTaskCount, o = window.setTimeout((function() {
                    n.inProgressTaskCount <= 0 || (t = new Fw(i,0),
                        e = window.setInterval((function() {
                                if (t.noticeEl.offsetParent) {
                                    var o = n.inProgressTaskCount
                                        , s = Math.max(0, r - o);
                                    t.noticeEl.setText(i + " (".concat(s, "/").concat(r, ")"))
                                } else
                                    clearInterval(e)
                            }
                        ), 300))
                }
            ), 1e3);
            this.onCleanCache((function() {
                    clearTimeout(o),
                        clearInterval(e),
                    t && (t.hide(),
                        new Fw(ye("interface.msg-indexing-complete")))
                }
            ))
        }
        ,
        e.prototype.linkResolver = function() {
            var t = this
                , e = Xh((this.linkResolverQueue = new Yh({
                onStop: function() {
                    return t.trigger("resolved")
                },
                onCancel: function() {
                    t.linkResolverQueue = null
                }
            })).generator());
            L(t, void 0, void 0, (function() {
                    var t, n, i, r, o, s;
                    return D(this, (function(a) {
                            switch (a.label) {
                                case 0:
                                    a.trys.push([0, 5, 6, 11]),
                                        t = I(e),
                                        a.label = 1;
                                case 1:
                                    return [4, t.next()];
                                case 2:
                                    if ((n = a.sent()).done)
                                        return [3, 4];
                                    if (!(i = n.value) || "md" !== i.extension)
                                        return [3, 3];
                                    this.resolveLinks(i.path),
                                        this.trigger("resolve", i),
                                        a.label = 3;
                                case 3:
                                    return [3, 1];
                                case 4:
                                    return [3, 11];
                                case 5:
                                    return r = a.sent(),
                                        o = {
                                            error: r
                                        },
                                        [3, 11];
                                case 6:
                                    return a.trys.push([6, , 9, 10]),
                                        n && !n.done && (s = t.return) ? [4, s.call(t)] : [3, 8];
                                case 7:
                                    a.sent(),
                                        a.label = 8;
                                case 8:
                                    return [3, 10];
                                case 9:
                                    if (o)
                                        throw o.error;
                                    return [7];
                                case 10:
                                    return [7];
                                case 11:
                                    return [2]
                            }
                        }
                    ))
                }
            ))
        }
        ,
        e.prototype.resolveLinks = function(t) {
            var e = this
                , n = this.getCache(t);
            if (n) {
                var i = {}
                    , r = {};
                tA(n, (function(n) {
                        var o = n.link
                            , s = QD(o)
                            , a = e.getFirstLinkpathDest(s, t);
                        a ? i[a.path] = (i[a.path] || 0) + 1 : (o = SA(o),
                            r[o] = (r[o] || 0) + 1)
                    }
                )),
                    this.resolvedLinks[t] = i,
                    this.unresolvedLinks[t] = r
            }
        }
        ,
        e.prototype.onCleanCache = function(t) {
            this.isCacheClean() ? t() : this.onCleanCacheCallbacks.push(t)
        }
        ,
        e.prototype.checkCleanCache = function() {
            for (; this.onCleanCacheCallbacks.length > 0 && this.isCacheClean(); ) {
                var t = this.onCleanCacheCallbacks.shift();
                try {
                    t()
                } catch (t) {
                    console.error(t)
                }
            }
        }
        ,
        e.prototype.isCacheClean = function() {
            return 0 === this.inProgressTaskCount && 0 === this.linkResolverQueue.items.length && !this.linkResolverQueue.runnable.isRunning()
        }
        ,
        e.prototype.updateRelatedLinks = function(t) {
            "md" === Gt(t) && (t = jt(t)),
                t = t.toLowerCase();
            for (var e = this.resolvedLinks, n = this.unresolvedLinks, i = 0, r = this.getCachedFiles(); i < r.length; i++) {
                var o = r[i];
                if (EA(t, e[o]) || EA(t, n[o])) {
                    var s = this.vault.getAbstractFileByPath(o);
                    s && s instanceof gw && this.linkResolverQueue.add(s)
                }
            }
        }
        ,
        e.prototype.onCreate = function(t) {
            this.onCreateOrModify(t),
            t && t instanceof gw && this.updateRelatedLinks(t.name)
        }
        ,
        e.prototype.onCreateOrModify = function(t) {
            var e = this;
            if (t && t instanceof gw) {
                this.uniqueFileLookup.add(t.name.toLowerCase(), t);
                var n = t.stat
                    , i = t.path
                    , r = this.fileCache[i];
                if ("md" !== t.extension)
                    return r = {
                        mtime: n.mtime,
                        size: n.size,
                        hash: ""
                    },
                        void this.saveFileCache(i, r);
                var o = !1;
                if (r) {
                    var s = r.mtime === n.mtime && r.size === n.size
                        , a = r.hash && !!this.metadataCache[r.hash];
                    o = s && a
                } else
                    r = {
                        mtime: 0,
                        size: 0,
                        hash: ""
                    },
                        this.saveFileCache(i, r);
                if (o)
                    this.linkResolverQueue.add(t);
                else {
                    this.inProgressTaskCount++,
                        this.workQueue.queue((function() {
                                return L(e, void 0, void 0, (function() {
                                        var o;
                                        return D(this, (function(s) {
                                                switch (s.label) {
                                                    case 0:
                                                        return s.trys.push([0, 2, , 3]),
                                                            [4, L(e, void 0, void 0, (function() {
                                                                    var e, o, s, a, l;
                                                                    return D(this, (function(c) {
                                                                            switch (c.label) {
                                                                                case 0:
                                                                                    return [4, this.vault.readBinary(t)];
                                                                                case 1:
                                                                                    return e = c.sent(),
                                                                                        o = z(e),
                                                                                        [4, U(e)];
                                                                                case 2:
                                                                                    if (s = c.sent(),
                                                                                        r.mtime = n.mtime,
                                                                                        r.size = n.size,
                                                                                        r.hash = s,
                                                                                        this.saveFileCache(i, r),
                                                                                        a = this.metadataCache[s])
                                                                                        return this.linkResolverQueue.add(t),
                                                                                            this.trigger("changed", t, o, a),
                                                                                            [2];
                                                                                    l = setTimeout((function() {
                                                                                            new Fw("Indexing taking a long time for " + t.path)
                                                                                        }
                                                                                    ), 1e4),
                                                                                        c.label = 3;
                                                                                case 3:
                                                                                    return c.trys.push([3, , 5, 6]),
                                                                                        [4, this.work(e)];
                                                                                case 4:
                                                                                    return a = c.sent(),
                                                                                        [3, 6];
                                                                                case 5:
                                                                                    return clearTimeout(l),
                                                                                        [7];
                                                                                case 6:
                                                                                    return a ? (this.saveMetaCache(s, a),
                                                                                        this.linkResolverQueue.add(t),
                                                                                        this.trigger("changed", t, o, a),
                                                                                        [2]) : (console.log("Metadata failed to parse", t),
                                                                                        [2])
                                                                            }
                                                                        }
                                                                    ))
                                                                }
                                                            ))];
                                                    case 1:
                                                        return s.sent(),
                                                            [3, 3];
                                                    case 2:
                                                        return o = s.sent(),
                                                            console.error(o),
                                                            [3, 3];
                                                    case 3:
                                                        return this.inProgressTaskCount--,
                                                        0 === this.inProgressTaskCount && this.trigger("finished"),
                                                            [2]
                                                }
                                            }
                                        ))
                                    }
                                ))
                            }
                        ))
                }
            }
        }
        ,
        e.prototype.onDelete = function(t) {
            t && t instanceof gw && (this.uniqueFileLookup.remove(t.name.toLowerCase(), t),
                this.trigger("deleted", t, this.getFileCache(t)),
                this.deletePath(t.path))
        }
        ,
        e.prototype.deletePath = function(t) {
            delete this.resolvedLinks[t],
                delete this.unresolvedLinks[t],
                this.saveFileCache(t, null),
                this.updateRelatedLinks(qt(t)),
                this.linkResolverQueue.add(null),
                this.trigger("finished")
        }
        ,
        e.prototype.onRename = function(t, e) {
            if (t && t instanceof gw) {
                var n = t.path
                    , i = this
                    , r = i.uniqueFileLookup
                    , o = i.resolvedLinks
                    , s = i.unresolvedLinks
                    , a = i.fileCache;
                r.remove(qt(e).toLowerCase(), t),
                    r.add(t.name.toLowerCase(), t),
                o.hasOwnProperty(e) && (o[n] = o[e],
                    delete o[e]),
                s.hasOwnProperty(e) && (s[n] = s[e],
                    delete s[e]),
                a.hasOwnProperty(e) && (this.saveFileCache(n, a[e]),
                    this.saveFileCache(e, null));
                var l = qt(e)
                    , c = qt(n);
                this.updateRelatedLinks(l),
                c !== l && this.updateRelatedLinks(c),
                    this.linkResolverQueue.add(null)
            }
        }
        ,
        e.prototype.saveFileCache = function(t, e) {
            e ? (this.fileCache[t] = e,
            this.db && this.db.transaction("file", "readwrite").store.put(e, t)) : (delete this.fileCache[t],
            this.db && this.db.transaction("file", "readwrite").store.delete(t))
        }
        ,
        e.prototype.saveMetaCache = function(t, e) {
            if (e) {
                this.metadataCache[t] = e;
                var n = JSON.parse(JSON.stringify(e));
                $D(n, YD),
                this.db && this.db.transaction("metadata", "readwrite").store.put(n, t)
            } else
                delete this.metadataCache[t],
                this.db && this.db.transaction("metadata", "readwrite").store.delete(t)
        }
        ,
        e.prototype.work = function(t) {
            var e = this;
            if (this.workerResolve)
                throw new Error("Work queue must be sequential!");
            return new Promise((function(n) {
                    e.workerResolve = n,
                        e.worker.postMessage({
                            metadataCache: t
                        }, [t])
                }
            ))
        }
        ,
        e.prototype.onReceiveMessageFromWorker = function(t) {
            this.workerResolve && (this.workerResolve(t.data),
                this.workerResolve = null)
        }
        ,
        e.prototype.cleanupDeletedCache = function() {
            var t = this.fileCache
                , e = this.metadataCache
                , n = {};
            for (var i in t) {
                if (t.hasOwnProperty(i))
                    n[t[i].hash] = !0
            }
            for (var r in e)
                e.hasOwnProperty(r) && (n[r] || this.saveMetaCache(r, null))
        }
        ,
        e.prototype.updateUserIgnoreFilters = function() {
            var t = this.app.vault.getConfig("userIgnoreFilters")
                , e = JSON.stringify(t);
            if (this.userIgnoreFiltersString !== e)
                if (this.userIgnoreFiltersString = e,
                    this.userIgnoreFilterCache = {},
                    t) {
                    var n = [];
                    this.userIgnoreFilters = n;
                    for (var i = 0, r = t; i < r.length; i++) {
                        var o = r[i];
                        try {
                            o.length > 2 && o.startsWith("/") && o.endsWith("/") ? n.push(new RegExp(o.substring(1, o.length - 1),"i")) : n.push(new RegExp("^" + vt(o),"i"))
                        } catch (t) {
                            console.error("Bad regex for user ignore filter", t)
                        }
                    }
                } else
                    this.userIgnoreFilters = null
        }
        ,
        e.prototype.isUserIgnored = function(t) {
            var e = this.userIgnoreFilters
                , n = this.userIgnoreFilterCache;
            if (!e)
                return !1;
            if (n.hasOwnProperty(t))
                return n[t];
            for (var i = !1, r = 0, o = e; r < o.length; r++) {
                if (o[r].test(t)) {
                    i = !0;
                    break
                }
            }
            return n[t] = i,
                i
        }
        ,
        e.prototype.trigger = function(e) {
            for (var n = [], i = 1; i < arguments.length; i++)
                n[i - 1] = arguments[i];
            t.prototype.trigger.apply(this, P([e], n, !1))
        }
        ,
        e.prototype.on = function(e, n, i) {
            return t.prototype.on.call(this, e, n, i)
        }
        ,
        e
}(hw)
