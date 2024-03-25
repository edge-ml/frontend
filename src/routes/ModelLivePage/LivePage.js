const LivePage = (bleDevice) => {
  return (
    <div className="m-2">
      <div>{bleDevice.device.name}</div>
    </div>
  );
};

export default LivePage;
