#!/bin/bash
# Security regression test: starts the server on a throwaway port and checks admin lockout,
# profile spoofing, input validation and CORS. Run: npm run test:security
cd "$(dirname "$0")/.."
rm -rf data
PORT=3111 ADMIN_TOKEN=correct-horse-battery-staple ADMIN_PROFILE_ID=owner node server.js > /tmp/khushu-test.log 2>&1 &
PID=$!
sleep 2
B=http://localhost:3111/api
fail=0
chk(){ # desc expected actual
  if [ "$2" = "$3" ]; then echo "PASS $1"; else echo "FAIL $1 (want $2 got $3)"; fail=1; fi; }
code(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }
chk "admin status no token" 403 $(code $B/admin/status)
chk "admin status wrong token" 403 $(code -H 'X-Admin-Token: nope' $B/admin/status)
chk "admin status right token" 200 $(code -H 'X-Admin-Token: correct-horse-battery-staple' $B/admin/status)
chk "settings no profile header" 400 $(code $B/settings)
chk "spoof admin profile GET settings" 403 $(code -H 'X-Profile-Id: owner' $B/settings)
chk "spoof admin profile POST settings" 403 $(code -X POST -H 'X-Profile-Id: owner' -H 'Content-Type: application/json' -d '{"volume":100,"adhanEnabled":false}' $B/settings)
chk "admin token can read admin settings" 200 $(code -H 'X-Profile-Id: owner' -H 'X-Admin-Token: correct-horse-battery-staple' $B/settings)
chk "create profile reserved name" 409 $(code -X POST -H 'Content-Type: application/json' -d '{"displayName":"Owner"}' $B/profiles)
chk "create profile ok" 200 $(code -X POST -H 'Content-Type: application/json' -d '{"displayName":"Amina"}' $B/profiles)
chk "create profile arabic" 200 $(code -X POST -H 'Content-Type: application/json' -d '{"displayName":"أمينة"}' $B/profiles)
chk "constructor profile settings POST 404" 404 $(code -X POST -H 'X-Profile-Id: constructor' -H 'Content-Type: application/json' -d '{"volume":5}' $B/settings)
chk "public list hides admin" 0 $(curl -s $B/profiles | grep -c '"isAdmin":true')
chk "admin list shows admin" 1 $(curl -s -H 'X-Admin-Token: correct-horse-battery-staple' $B/profiles | grep -c '"isAdmin":true')
chk "user updates own settings" 200 $(code -X POST -H 'X-Profile-Id: amina' -H 'Content-Type: application/json' -d '{"volume":40,"selectedReciter":"el-kourdi"}' $B/settings)
chk "volume clamp" 100 $(curl -s -X POST -H 'X-Profile-Id: amina' -H 'Content-Type: application/json' -d '{"volume":9999}' $B/settings | python3 -c 'import sys,json;print(json.load(sys.stdin)["settings"]["volume"])')
chk "bad reciter ignored" el-kourdi $(curl -s -X POST -H 'X-Profile-Id: amina' -H 'Content-Type: application/json' -d '{"selectedReciter":"../../etc"}' $B/settings | python3 -c 'import sys,json;print(json.load(sys.stdin)["settings"]["selectedReciter"])')
chk "delete profile no token" 403 $(code -X DELETE -H 'X-Profile-Id: owner' $B/profiles/amina)
chk "delete profile with token" 200 $(code -X DELETE -H 'X-Admin-Token: correct-horse-battery-staple' $B/profiles/amina)
chk "ummah no key" 503 $(code $B/ummah/duas)
chk "ummah path allowlist" 503 $(code $B/ummah/admin/users)
chk "cors not open" 0 $(curl -s -i -H 'Origin: https://evil.example' $B/reciters | grep -ci 'access-control-allow-origin')
chk "reciters public" 200 $(code $B/reciters)
chk "no x-powered-by" 0 $(curl -si $B/reciters | grep -ci x-powered-by)
kill $PID; rm -rf data
echo "---- server log"; head -5 /tmp/khushu-test.log
exit $fail
