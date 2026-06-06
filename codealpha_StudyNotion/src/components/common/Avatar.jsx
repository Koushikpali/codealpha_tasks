import Avatar from "react-avatar";

function UserAvatar({ name, imageUrl }) {
  return (
    <Avatar
      name={name}              // fallback initials (e.g., "KP")
      src={imageUrl}           // user's profile pic
      round={true}
      size="35"
      textSizeRatio={2}
      color="#4A90E2"          // optional custom background color
    />
  );
}

export default UserAvatar
