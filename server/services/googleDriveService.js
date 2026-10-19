const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const TOKENS_PATH = path.join(__dirname, '../data/google_tokens.json');

function ensureDataDir() {
  const dir = path.dirname(TOKENS_PATH);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
}

class GoogleDriveService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
    this.oauth2Client = null;
    this.initOAuth();
  }

  initOAuth() {
    if (this.clientId && this.clientSecret) {
      this.oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        this.redirectUri
      );

      // Load saved tokens if available
      const tokens = this.getSavedTokens();
      if (tokens) {
        this.oauth2Client.setCredentials(tokens);
      }
    }
  }

  getSavedTokens() {
    ensureDataDir();
    if (fs.existsSync(TOKENS_PATH)) {
      try {
        const raw = fs.readFileSync(TOKENS_PATH, 'utf8');
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  saveTokens(tokens) {
    ensureDataDir();
    try {
      fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf8');
      if (this.oauth2Client) {
        this.oauth2Client.setCredentials(tokens);
      }
    } catch (e) {
      console.error('Failed to save Google Drive tokens:', e);
    }
  }

  clearTokens() {
    ensureDataDir();
    if (fs.existsSync(TOKENS_PATH)) {
      try { fs.unlinkSync(TOKENS_PATH); } catch (e) {}
    }
    if (this.oauth2Client) {
      this.oauth2Client.setCredentials({});
    }
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      this.initOAuth();
    }
    if (!this.oauth2Client) {
      return null;
    }
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async handleCallback(code) {
    if (!this.oauth2Client) this.initOAuth();
    const { tokens } = await this.oauth2Client.getToken(code);
    this.saveTokens(tokens);

    let email = 'Google Account';
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userinfo = await oauth2.userinfo.get();
      email = userinfo.data.email || email;
    } catch (e) {}

    return { success: true, email };
  }

  async getStatus() {
    const tokens = this.getSavedTokens();
    const isConfigured = Boolean(this.clientId && this.clientSecret);
    const isConnected = Boolean(tokens && (tokens.access_token || tokens.refresh_token));

    let email = null;
    if (isConnected && this.oauth2Client) {
      try {
        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const userinfo = await oauth2.userinfo.get();
        email = userinfo.data.email;
      } catch (e) {}
    }

    return {
      isConfigured,
      isConnected,
      email,
      provider: 'Google Drive',
      vaultName: 'VidNote Cloud Vault',
      clientIdConfigured: Boolean(this.clientId),
    };
  }

  async ensureVaultFolder(drive) {
    try {
      const res = await drive.files.list({
        q: "name = 'VidNote Cloud Vault' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id, name)',
        spaces: 'drive',
      });
      if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id;
      }

      // Create folder
      const folderMetadata = {
        name: 'VidNote Cloud Vault',
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });
      return folder.data.id;
    } catch (e) {
      console.warn('Folder creation warning:', e.message);
      return null;
    }
  }

  async uploadVideo(buffer, filename, mimeType = 'video/mp4', metadata = {}) {
    if (!this.oauth2Client || !this.getSavedTokens()) {
      throw new Error('Google Drive not connected. Please connect Google Drive first.');
    }

    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const folderId = await this.ensureVaultFolder(drive);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: filename || `VidNote_${Date.now()}.mp4`,
      parents: folderId ? [folderId] : [],
      description: `VidNote Cloud Backup\nCaption: ${metadata.caption || ''}\nHashtags: ${(metadata.hashtags || []).join(' ')}`,
    };

    const media = {
      mimeType,
      body: stream,
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink, thumbnailLink, size',
    });

    return {
      driveFileId: res.data.id,
      name: res.data.name,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink,
      thumbnailLink: res.data.thumbnailLink,
      status: 'uploaded_to_google_drive',
    };
  }
}

module.exports = new GoogleDriveService();
