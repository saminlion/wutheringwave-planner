import logger from '@/utils/logger';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Initialize GAPI
export function loadGapiScript() {
    return new Promise((resolve, reject) => {
        if (document.getElementById('gapiScript')) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.id = 'gapiScript';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function initializeGapi() {
    await loadGapiScript();

    return new Promise((resolve, reject) => {
        gapi.load('client:auth2', async () => {
            try {
                await gapi.client.init({
                    apiKey: 'AIzaSyCYNluBRqMzMGTSVtYrhf0vAQacdR0h5qk', // Google Cloud Console에서 생성한 API 키
                    clientId: '97986213844-q6ns3b5eqaqk5l7kusp1moc4vopsnbp4.apps.googleusercontent.com', // OAuth 클라이언트 ID
                    discoveryDocs: [
                        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                    ],
                    scope: SCOPES.join(' '),
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Google OAuth 로그인
export async function handleLogin() {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    try {
        const user = await GoogleAuth.signIn();
        logger.info('User signed in:', user.getBasicProfile().getEmail());
        return GoogleAuth.currentUser.get().getAuthResponse();
    } catch (error) {
        logger.error('Login failed:', error);
        throw error;
    }
}

// Google Drive에 파일 저장
export async function saveGoalsToDrive(goals) {
    const fileMetadata = {
        name: 'goals.json',
        mimeType: 'application/json',
    };

    const media = {
        mimeType: 'application/json',
        body: JSON.stringify(goals),
    };

    try {
        const response = await gapi.client.drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        logger.info('File created with ID:', response.result.id);
        return response.result.id;
    } catch (error) {
        logger.error('Error creating file:', error);
        throw error;
    }
}

// Google Drive에서 파일 읽기
export async function loadGoalsFromDrive(fileId) {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        logger.debug('File content:', response);
        return response.result;
    } catch (error) {
        logger.error('Error loading file:', error);
        throw error;
    }
}