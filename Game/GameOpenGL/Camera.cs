using OpenTK.Mathematics;

namespace GameOpenGL;

public class Camera
{
    public Vector3 Position { get; private set; }
    public Vector3 Target { get; private set; }

    public Matrix4 ViewMatrix => Matrix4.LookAt(Position, Target, Vector3.UnitY);

    public void Follow(Vector3 playerPos)
    {
        Target = playerPos;
        Position = new Vector3(playerPos.X + 0f, playerPos.Y + 3f, playerPos.Z + 8f);
    }
}