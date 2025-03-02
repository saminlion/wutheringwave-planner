import { google } from 'googleapis';
import { usePlannerStore } from '../store/planner';

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

export async function getAccessToken(oAuth2Client, code) {
    const { tokens } = await oAuth2Client.getAccessToken(code);

    oAuth2Client.setCredentials(tokens);

    return oAuth2Client;
}

export async function saveGoalsToDrive(authClient, goals)
{
    const drive = google.drive({ version: 'v3', auth: authClient});

    const fileMetadata = {
        name: 'goals.json',
        mimetype: 'application/json',
    };

    const media = {
        mimetype: 'application/json',
        body: JSON.stringify(goals),
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });

    console.log('File ID:', response.data.id);
}

export async function loadGoalsFromDrive(authClient, fileId)
{
    const drive = google.drive({ version: 'v3', auth: authClient});

    const response = await drive.files.get({
        fields: fileId,
        alt: 'media',
    });

    return JSON.parse(response.data); 
}

export default async function initializeApp() {

    // Step 1: 브라우저에서 code 얻기
    const code = 'AUTHORIZATION_CODE'; // 리디렉션 URI에서 얻은 code
    const client = await getAccessToken(authClient, code);

    // Step 2: 파일 ID 얻기
    const plannerStore = usePlannerStore();
    let fileId = await findFile(client, 'goals.json');

    // 파일이 없으면 새로 생성
    if (!fileId) {
        fileId = await saveGoalsToDrive(client, plannerStore.goals);
        console.log('Created new file with ID:', fileId);
    }

    // Step 3: 파일 로드
    await plannerStore.loadGoals(client, fileId);
}