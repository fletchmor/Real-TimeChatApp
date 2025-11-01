import './UserList.css';

function UserList({ users, currentUser }) {
  return (
    <div className="user-list">
      <h3 className="user-list-header">Online Users ({users.length})</h3>
      <div className="user-list-items">
        {users.length === 0 ? (
          <div className="no-users">No users online</div>
        ) : (
          users.map((user) => (
            <div
              key={user.userId}
              className={`user-item ${user.username === currentUser ? 'current-user' : ''}`}
            >
              <div className="user-status-indicator"></div>
              <span className="user-name">
                {user.username}
                {user.username === currentUser && ' (You)'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserList;
