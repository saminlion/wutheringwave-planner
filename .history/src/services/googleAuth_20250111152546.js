import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Drive 파일 접근 권한

export async function getGoogleAuth() {
    const oAuth2Client = new google.auth.OAuth2(
        '97986213844-q6ns3b5eqaqk5l7kusp1moc4vopsnbp4.apps.googleusercontent.com',
        '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',
        'http://localhost:3000'
    );

    // 인증 URL 생성
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    return oAuth2Client;
}