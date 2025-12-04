# 🚨 MAGIC MARK - RELEASE CHECKLIST

## 📅 Stand: 7. November 2024
## ⚠️ KRITISCH: Diese Punkte MÜSSEN vor dem NPM Release überprüft werden!

---

## ✅ PRE-RELEASE TESTS

### 1. Test-Suite ausführen:
```bash
cd /Users/schero/Desktop/Privat.nosync/NPM-PUBLISH/magic-link-dev/src/plugins/magic-mark
node test-magic-mark.js
```

### 2. Erfolgs-Kriterien:
- [ ] **Mindestens 80% Pass Rate**
- [ ] Alle CRUD-Operationen funktionieren
- [ ] License Management funktioniert
- [ ] Role/User Sharing funktioniert
- [ ] Reorder/Pin Features funktionieren

---

## 📊 ENDPOINT-STATUS

| Endpoint | Status | Critical | Anmerkung |
|----------|--------|----------|-----------|
| **BOOKMARK MANAGEMENT** |
| GET /magic-mark/bookmarks | ⚠️ TEST | ✅ | Alle Bookmarks abrufen |
| POST /magic-mark/bookmarks | ⚠️ TEST | ✅ | Bookmark erstellen |
| PUT /magic-mark/bookmarks/:id | ⚠️ TEST | ✅ | Bookmark updaten |
| DELETE /magic-mark/bookmarks/:id | ⚠️ TEST | ✅ | Bookmark löschen |
| POST /magic-mark/bookmarks/:id/pin | ⚠️ TEST | ❌ | Pin Toggle |
| POST /magic-mark/bookmarks/reorder | ⚠️ TEST | ❌ | Drag & Drop Reorder |
| **SHARING** |
| GET /magic-mark/roles | ⚠️ TEST | ✅ | Verfügbare Rollen |
| GET /magic-mark/users | ⚠️ TEST | ✅ | Verfügbare Users |
| **LICENSE** |
| GET /magic-mark/license/status | ⚠️ TEST | ✅ | License Status |
| POST /magic-mark/license/auto-create | ⚠️ TEST | ❌ | Auto-Create License |
| POST /magic-mark/license/create | ⚠️ TEST | ❌ | Manual Create |
| POST /magic-mark/license/ping | ⚠️ TEST | ❌ | License Ping |
| POST /magic-mark/license/store-key | ⚠️ TEST | ❌ | Store License Key |

---

## 🔍 CODE QUALITY CHECKS

### TypeScript Compilation
```bash
npm run test:ts:front  # Admin TypeScript
npm run test:ts:back   # Server TypeScript
```

### Build & Verify
```bash
npm run build    # Build plugin
npm run verify   # Verify structure
```

### Linting (if configured)
```bash
npm run lint     # Check code style
npm run format   # Auto-fix formatting
```

---

## 📝 DOCUMENTATION CHECKS

- [ ] **README.md** ist aktuell
- [ ] **CHANGELOG.md** enthält alle Änderungen
- [ ] **Package.json** Version ist erhöht
- [ ] **License** ist korrekt (MIT)
- [ ] **Screenshots** sind aktuell

---

## 🚀 RELEASE STEPS

### 1. Version Update
```json
// package.json
{
  "version": "1.3.2"  // Erhöhe von 1.3.1
}
```

### 2. Changelog Update
```markdown
## [1.3.2] - 2024-11-07
### Fixed
- Improved response handling
- Better error messages
### Added
- Comprehensive test suite
- Test documentation
```

### 3. Git Commit & Tag
```bash
git add .
git commit -m "chore: release v1.3.2"
git tag v1.3.2
git push origin main --tags
```

### 4. Build Final Version
```bash
npm run build
npm run verify
```

### 5. NPM Publish
```bash
npm publish
# oder mit dry-run zum Testen:
npm publish --dry-run
```

---

## ⚠️ BEKANNTE ISSUES

### 1. Content-Type Dependencies
- Plugin erwartet bestimmte Content-Types
- Pfade müssen eventuell angepasst werden
- Test mit verschiedenen Strapi-Setups nötig

### 2. License System
- Muss beim ersten Start aktiviert werden
- Auto-Create nutzt Admin-User Daten
- Grace Period für Offline-Nutzung

### 3. Compatibility
- Strapi v5.29.0+ required
- Node.js 18+ recommended
- TypeScript 5.9.3+

---

## 📋 FINALE CHECKLISTE

### Funktionalität
- [ ] Alle Tests laufen durch (80%+ Pass Rate)
- [ ] Frontend funktioniert einwandfrei
- [ ] Keine Console Errors im Browser
- [ ] Mobile Responsive funktioniert

### Code-Qualität
- [ ] TypeScript kompiliert ohne Fehler
- [ ] Build erstellt ohne Warnings
- [ ] Keine TODO Comments im Code
- [ ] Keine Debug Console.logs

### Dokumentation
- [ ] README ist vollständig
- [ ] API Dokumentation aktuell
- [ ] Beispiele funktionieren
- [ ] Installation Guide getestet

### Release
- [ ] Version erhöht
- [ ] Changelog aktualisiert
- [ ] Git Tag erstellt
- [ ] NPM Publish erfolgreich

---

## 🆘 SUPPORT NACH RELEASE

### Häufige User-Probleme:

1. **"License not valid"**
   - Lösung: License aktivieren im Admin UI
   - Auto-Create nutzen

2. **"Cannot find content-type"**
   - Lösung: Pfade in Bookmarks anpassen
   - Content-Types müssen existieren

3. **"Permission denied"**
   - Admin-Rechte erforderlich
   - Role-based permissions prüfen

---

## 📊 POST-RELEASE MONITORING

### NPM Stats überprüfen:
```bash
npm view strapi-plugin-magic-mark
```

### GitHub Issues beobachten:
- https://github.com/Schero94/Magicmark/issues

### Version Tags:
```bash
git tag -l
npm dist-tag ls strapi-plugin-magic-mark
```

---

## 🎯 SUCCESS METRICS

Nach Release sollte:
- NPM Package erfolgreich installierbar sein
- Keine kritischen Issues in ersten 24h
- Download-Zahlen steigen
- Positive Rückmeldungen kommen

---

## 📝 NOTIZEN

- **Aktuelle Version:** 1.3.1
- **Nächste Version:** 1.3.2 (empfohlen)
- **Test-Suite:** `test-magic-mark.js`
- **Setup Guide:** `TEST_SETUP.md`
- **Letzte Tests:** Noch nicht ausgeführt

---

**⚠️ WICHTIG:** 
- Tests MÜSSEN vor Release ausgeführt werden!
- Mindestens 80% Pass Rate erforderlich
- Alle kritischen Endpoints müssen funktionieren

---

**Erstellt von:** Cursor AI Assistant  
**Datum:** 07.11.2024  
**Plugin:** Magic Mark v1.3.1
