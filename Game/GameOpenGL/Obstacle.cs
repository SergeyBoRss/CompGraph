using OpenTK.Graphics.OpenGL;
using OpenTK.Mathematics;

namespace GameOpenGL;

public class Obstacle
{
    public Vector3 Position;
    private readonly Vector3 _size;

    public Obstacle(float height)
    {
        _size = new Vector3(0.8f, height, 0.8f);
        Position = new Vector3();
    }

    public void Draw()
    {
        GL.PushMatrix();
        GL.Translate(Position);
        GL.Color3(0.8f, 0f, 0f);
        Primitives.Cube(_size);
        GL.PopMatrix();
    }

    public bool CheckCollision(Vector3 point, float radius)
    {
        Vector3 half = _size / 2f;
        Vector3 clamped = Vector3.ComponentMin(
            Vector3.ComponentMax(point, Position - half),
            Position + half);
        return (point - clamped).LengthSquared <= radius * radius;
    }
}