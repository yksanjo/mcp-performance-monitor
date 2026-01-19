# Discord Screenshot Guide for MCP Performance Monitor

## Recommended Screenshots for Discord Post

### 1. **Dashboard Overview** (Most Important)
```
Take a screenshot of the main dashboard showing:
- Server performance cards
- Recent activity chart
- Overall metrics summary

File: `screenshots/dashboard-overview.png`
```

### 2. **Server Comparison View**
```
Take a screenshot showing:
- Side-by-side server comparison
- Performance metrics table
- Cost breakdown

File: `screenshots/server-comparison.png`
```

### 3. **Cost Analysis Page**
```
Take a screenshot showing:
- Cost breakdown by server
- Daily/weekly cost trends
- Budget alerts section

File: `screenshots/cost-analysis.png`
```

### 4. **Usage Patterns**
```
Take a screenshot showing:
- Hourly usage heatmap
- Operation distribution
- Peak hours analysis

File: `screenshots/usage-patterns.png`
```

## How to Take Good Screenshots

### On Mac:
```bash
# Full screen: Command + Shift + 3
# Selection: Command + Shift + 4
# Window: Command + Shift + 4, then Space, click window
```

### On Windows:
```bash
# Full screen: Windows + Print Screen
# Selection: Windows + Shift + S
# Snipping Tool: Search for "Snipping Tool"
```

### Tips for Better Screenshots:
1. **Clean UI**: Close unnecessary tabs/windows
2. **Good Data**: Make sure demo data is showing interesting patterns
3. **Highlight Features**: Use arrows/circles if needed (can add in Discord)
4. **Consistent Size**: Keep screenshots similar dimensions
5. **File Names**: Use descriptive names for easy uploading

## Creating a Screenshot Gallery

### Step 1: Start the Application
```bash
cd mcp-performance-monitor
npm run start:demo
# Wait for both backend and frontend to start
```

### Step 2: Navigate to Key Pages
1. **Dashboard**: http://localhost:5173
2. **Servers Page**: http://localhost:5173/servers
3. **Metrics Page**: http://localhost:5173/metrics
4. **Usage Page**: http://localhost:5173/usage

### Step 3: Take Screenshots
Take 4-5 screenshots showing different features.

### Step 4: Upload to Discord
1. Click the "+" button in Discord message box
2. Select your screenshots
3. Add alt text if desired
4. Post with your message

## Example Discord Post with Screenshots

```
🎉 **MCP Performance Monitor - Visual Tour** 🎉

Just launched an open source tool to optimize your Claude + MCP workflows!

**📊 Dashboard Overview**
[IMAGE: dashboard-overview.png]
Real-time performance metrics for all your MCP servers.

**🔍 Server Comparison**
[IMAGE: server-comparison.png]
Compare servers side-by-side to choose the best ones.

**💰 Cost Analysis**
[IMAGE: cost-analysis.png]
Track and optimize spending across MCP providers.

**📈 Usage Patterns**
[IMAGE: usage-patterns.png]
Understand when and how your servers are being used.

**Get Started:**
```bash
git clone https://github.com/yksanjo/mcp-performance-monitor.git
cd mcp-performance-monitor
npm run install:all && npm run db:seed && npm run start:demo
```

**GitHub:** https://github.com/yksanjo/mcp-performance-monitor

What do you think? What features would help your Claude development most? 🚀
```

## If You Can't Take Screenshots Right Now

### Use This Text-Only Version:
```
🚀 **MCP Performance Monitor - No Screenshot Version**

Just launched an open source tool but can't share screenshots right now. Here's what it looks like:

**Visual Features:**
• Clean, modern dashboard with real-time charts
• Server comparison tables with side-by-side metrics
• Cost analysis with colorful breakdown charts
• Usage heatmaps showing peak hours
• Alert panels for performance issues

**Imagine:**
A dashboard showing your MCP servers' performance, costs, and usage patterns - all in one place!

**Try It Yourself:**
```bash
git clone https://github.com/yksanjo/mcp-performance-monitor.git
cd mcp-performance-monitor
npm run install:all && npm run db:seed && npm run start:demo
# Open http://localhost:5173 to see it live!
```

**GitHub:** https://github.com/yksanjo/mcp-performance-monitor

The best way to see it is to run it locally! Would love feedback on the UI/UX. 🎨
```

## Discord Image Hosting Alternatives

If you need to host images elsewhere:
1. **GitHub Issues**: Create an issue with screenshots, then link to them
2. **Imgur**: Free image hosting
3. **Cloudinary**: Free tier available
4. **GitHub Repository**: Add to `screenshots/` folder in repo

## Quick Screenshot Script

Create a simple script to help take screenshots:

```bash
#!/bin/bash
# screenshot-helper.sh

echo "=== MCP Performance Monitor Screenshot Helper ==="
echo ""
echo "1. Make sure the application is running:"
echo "   npm run start:demo"
echo ""
echo "2. Open these URLs in your browser:"
echo "   • Dashboard: http://localhost:5173"
echo "   • Servers: http://localhost:5173/servers"
echo "   • Metrics: http://localhost:5173/metrics"
echo "   • Usage: http://localhost:5173/usage"
echo ""
echo "3. Take screenshots using:"
echo "   Mac: Command + Shift + 4, then drag selection"
echo "   Windows: Windows + Shift + S"
echo ""
echo "4. Save screenshots to: screenshots/"
echo "   mkdir -p screenshots"
echo ""
echo "5. Upload to Discord with your post!"
```

Save this as `screenshot-helper.sh` and run it when ready to take screenshots.

## Final Recommendation

**Do this now:**
1. Copy one of the text posts from `anthropic-discord-post.md`
2. Post in #showcase or #mcp channel
3. Engage with any responses

**Do later (if possible):**
1. Take 2-3 good screenshots
2. Edit your Discord post to include them
3. Or create a new post with visual tour

Even without screenshots, a well-written text post will get engagement in the Anthropic Discord community! 🎯