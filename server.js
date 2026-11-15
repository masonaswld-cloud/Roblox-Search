const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "Roblox Player API",
    endpoint: "/player/:username"
  });
});

app.get("/player/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Search for the Roblox username
    const searchResponse = await fetch(
      `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`
    );

    if (!searchResponse.ok) {
      return res.status(502).json({
        error: "Roblox search failed"
      });
    }

    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) {
      return res.status(404).json({
        error: "Player not found",
        username
      });
    }

    const player = searchData.data[0];

    // Get full Roblox profile information
    const userResponse = await fetch(
      `https://users.roblox.com/v1/users/${player.id}`
    );

    if (!userResponse.ok) {
      return res.status(502).json({
        error: "Could not get Roblox profile"
      });
    }

    const user = await userResponse.json();

    // Get profile avatar
    const avatarResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=420x420&format=Png&isCircular=false`
    );

    let avatar = null;

    if (avatarResponse.ok) {
      const avatarData = await avatarResponse.json();
      avatar = avatarData.data?.[0]?.imageUrl || null;
    }

    res.json({
      profile: `https://www.roblox.com/users/${user.id}/profile`,
      robloxId: user.id,
      username: user.name,
      displayName: user.displayName,
      description: user.description || "No description",
      joinedRoblox: user.created,
      avatar: avatar
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox Player API running on port ${PORT}`);
});
