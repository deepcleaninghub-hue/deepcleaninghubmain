# iOS Network Connectivity Troubleshooting Guide

## Current Configuration

- **Base URL**: `http://192.168.29.112:5001/api`
- **Platform**: iOS
- **Info.plist**: Configured with NSAppTransportSecurity

## Steps to Fix Network Issues

### 1. Rebuild the iOS App
After making Info.plist changes, you MUST rebuild:
```bash
cd admin-app
npx expo prebuild --clean
npx expo run:ios
```

### 2. Verify Network Connectivity
- Ensure iOS device/simulator is on the same Wi-Fi network as `192.168.29.112`
- Test in Safari on iOS: Open `http://192.168.29.112:5001/api/health` (or any endpoint)
- If Safari can't connect, the issue is network-level, not app-level

### 3. Check Server Accessibility
- Verify backend server is running: `curl http://192.168.29.112:5001/api/health`
- Check firewall settings on the server machine
- Ensure port 5001 is not blocked

### 4. Verify IP Address
- Find your Mac's IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- If IP changed, update `admin-app/src/config/environment.ts`
- Update Info.plist exception domains if IP changed

### 5. Check Console Logs
Look for these logs in Xcode console:
- `🌐 HTTP Client initialized:` - Shows base URL
- `📱 iOS Network Configuration:` - Shows iOS config
- `📤 Request:` - Shows outgoing requests
- `🚫 Network error:` - Shows detailed error info

### 6. Common Issues

#### Issue: "Network request failed"
- **Solution**: Check Info.plist NSAppTransportSecurity settings
- **Solution**: Ensure `NSAllowsArbitraryLoads` is `true`
- **Solution**: Verify exception domains include your IP

#### Issue: "Connection timeout"
- **Solution**: Check if server is running
- **Solution**: Verify device and server are on same network
- **Solution**: Check firewall/antivirus blocking connections

#### Issue: "Could not connect to server"
- **Solution**: Verify IP address is correct
- **Solution**: Check server is listening on correct port
- **Solution**: Test with curl or Postman first

### 7. Alternative: Use Production URL
If local development isn't working, temporarily use production:
```bash
export EXPO_PUBLIC_API_BASE_URL=https://app.deepcleaninghub.com/api
npx expo run:ios
```

### 8. Test Network Utility
Use the network test utility:
```typescript
import { testNetworkConnectivity } from '@/utils/networkTest';
const result = await testNetworkConnectivity();
console.log('Network test:', result);
```

## Debug Checklist

- [ ] App rebuilt after Info.plist changes
- [ ] Device on same network as server
- [ ] Server is running and accessible
- [ ] Can access URL in Safari on iOS device
- [ ] Info.plist has correct NSAppTransportSecurity settings
- [ ] Base URL is correct in environment.ts
- [ ] No firewall blocking connections
- [ ] Checked console logs for detailed errors

