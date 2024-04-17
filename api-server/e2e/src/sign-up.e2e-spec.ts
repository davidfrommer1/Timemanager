
import { UserSession } from './user-session';

describe('sign-up', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  it('should create an User', async () => {
    await userSession.registerUser();
    const data = userSession.signUpData();
    userSession.deleteUser();
    const response = await userSession.post('/users', data);
    expect(response.status).toBe(201);
  });

  it('should fail to create an User', async () => {
    await userSession.registerUser();
    const data = userSession.signUpData();
    const response = await userSession.post('/users', data);
    expect(response.status).toBe(400);
  });
});
