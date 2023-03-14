import './App.css';
import { useState } from 'react';

function App() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [followers, setFollowers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (isDisabled()) {
        return;
    }
    fetchData();
  }

  const isDisabled = () => !user1 || !user2 || loading;
  
  async function fetchData() {
    setLoading(true);
    setErrors([]);
    try {
      const requests = [user1, user2].map((user) => fetch(`https://api.github.com/users/${user.trim()}/followers`));
      const responses = await Promise.all(requests);
      const errors = responses.filter((response) => !response.ok);

      if (errors.length > 0) {
        throw errors.map((response) => Error(response.statusText));
      }

      const json = responses.map((response) => response.json());
      const [followers1, followers2] = await Promise.all(json);
      const commonFollowers = followers1.filter(x1 => followers2.find(x2 => x1.login === x2.login));
      setFollowers(commonFollowers);
    }
    catch(errors) {
      errors.forEach((error) => console.error(error));
      const errMessages = errors.map((err, i) => ({
        id: i,
        message: err.message || `Some error occurred with user ${i + 1}.`
      }));
      setErrors(errMessages);
      setFollowers([]);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <h3>GitHub users and their common followers</h3>
      <form onSubmit={onSubmit}>
        <input placeholder="User 1" value={user1} onChange={(e) => setUser1(e.target.value)} />
        <input placeholder="User 2" value={user2} onChange={(e) => setUser2(e.target.value)} />
        <button type="submit" disabled={isDisabled()}>Get common followers</button>
      </form>
      {followers.length ? <ul>
          Common Followers:
          {followers.map(x => (
            <li key={x.id}>{x.login}</li>
          ))}
        </ul> :
        (errors.length ? <ul>
          Errors:
          {errors.map(x => (
            <li key={x.id} style={{color: 'red'}}>{x.message}</li>
          ))}
        </ul> : <p>There are no common followers.</p>)
      }
    </div>
  );
}

export default App;
