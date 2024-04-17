import { UserSession } from './user-session';

describe('/changepassword', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#GET', () => {
    it('should return an userarray with the length 1', async () => {
      const response = await userSession.get('/users');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toBe(1);
    });
  });
});
