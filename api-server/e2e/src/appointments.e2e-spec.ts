
import { UserSession } from './user-session';

describe('/appointments', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#POST', () => {
    it('should return error with status 401', async () => {
      await userSession.deleteUser();
      const response = await userSession.post('/appointments', {
        title: 'Test',
        datum: '2021-05-26T10:10'
      });
      expect(response.status).toBe(401);
    });

    it('should return an appointment with the title "Test"', async () => {
      const now = new Date().getTime();
      const response = await userSession.post('/appointments', {
        title: 'Test',
        datum: '2021-05-26T10:10'
      });
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.title).toBe('Test');
      expect(json.id).toBeTruthy();
      expect(json.createdAt).toBeTruthy();
      expect(Number(json.createdAt)).toBeGreaterThanOrEqual(now);
    });
  });

  describe('#GET', () => {
    it('should return an empty list of appointments because the user is new', async () => {
      const response = await userSession.get('/appointments');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results).toEqual([]);
    });

    it('should return a list with two appointments', async () => {
      await userSession.post('/appointments', { title: 'Test', datum: '2021-05-26T10:10' });
      await userSession.post('/appointments', { title: 'Test2', datum: '2021-05-27T10:10' });
      const response = await userSession.get('/appointments');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(2);
      expect(json.results[0].title).toEqual('Test');
      expect(json.results[1].title).toEqual('Test2');
    });
  });
  describe('#DELETE', () => {
    it('should delete the first appointment', async () => {
      await userSession.post('/appointments', { title: 'Test', datum: '2021-05-26T10:10' });
      const response = await userSession.get('/appointments');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);

      await userSession.delete('/appointments/' + json.results[0].id);
      const response2 = await userSession.get('/appointments');
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.results.length).toEqual(0);
    });
  });

  describe('#PATCH', () => {
    it('should change the title of the first appointment from Test to FOO', async () => {
      await userSession.post('/appointments', { title: 'Test', datum: '2021-05-26T10:10' });
      const response = await userSession.get('/appointments');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);
      expect(json.results[0].title).toEqual('Test');
      const newAppointment = {
        title: 'FOO'
      };
      await userSession.patch('/appointments/' + json.results[0].id, newAppointment);
      const response2 = await userSession.get('/appointments');
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.results.length).toEqual(1);
      expect(json2.results[0].title).toEqual('FOO');
    });

    it('should change the description of the first appointment from Foo to Test', async () => {
      await userSession.post('/appointments', { title: 'Test', datum: '2021-05-26T10:10', description: 'FOO' });
      const response = await userSession.get('/appointments');
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.results.length).toEqual(1);
      expect(json.results[0].description).toEqual('FOO');
      const newAppointment = {
        description: 'FOO'
      };
      await userSession.patch('/appointments/' + json.results[0].id, newAppointment);
      const response2 = await userSession.get('/appointments');
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.results.length).toEqual(1);
      expect(json2.results[0].description).toEqual('FOO');
    });
  });
});
