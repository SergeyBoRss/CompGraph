using OpenTK.Graphics.OpenGL;
using OpenTK.Mathematics;
using OpenTK.Windowing.GraphicsLibraryFramework;
using System;

namespace GameOpenGL;

public class Player
{
    // ――― полосы ―――
    private int _currentLane = 0;
    private const float LaneOffset = 2f;

    // ――― прыжок ―――
    private float _velocityY = 0f;
    private const float Gravity = 20f;
    private const float JumpImpulse = 8f;

    public Vector3 Position { get; private set; } = new(0, 0.5f, 0);


    private float _rollAngle = 0f;

    private const float Radius = 0.5f;

    // скорость вращения
    private const float RollRate = 10f * 360f / (MathF.PI * 2f * Radius);

    public void Update(float dt, KeyboardState kbd)
    {
        // перестроения A / D
        if (kbd.IsKeyPressed(Keys.A) && _currentLane > -1) _currentLane--;
        if (kbd.IsKeyPressed(Keys.D) && _currentLane < 1) _currentLane++;

        float targetX = _currentLane * LaneOffset;
        Position = new Vector3(MathHelper.Lerp(Position.X, targetX, 10f * dt),
            Position.Y,
            Position.Z);

        // прыжок (Space)
        if (kbd.IsKeyPressed(Keys.Space) && Position.Y <= 0.51f)
            _velocityY = JumpImpulse;

        _velocityY -= Gravity * dt;
        Position += new Vector3(0, _velocityY * dt, 0);

        if (Position.Y < 0.5f) // приземление
        {
            Position = new Vector3(Position.X, 0.5f, Position.Z);
            _velocityY = 0f;
        }
        
        _rollAngle = (_rollAngle + RollRate * dt) % 360f;
    }

    public void Reset()
    {
        _currentLane = 0;
        Position = new Vector3(0, 0.5f, 0);
        _velocityY = 0f;
        _rollAngle = 0f;
    }

    public void Draw()
    {
        GL.PushMatrix();
        GL.Translate(Position);
        GL.Rotate(_rollAngle, 1, 0, 0); // вращение вокруг X

        // ― тело ―
        GL.Color3(1f, 0.82f, 0f);
        Primitives.Sphere(Radius, 20, 20);

        // ― лицо ―
        GL.Disable(EnableCap.Lighting);
        GL.Color3(0f, 0f, 0f); // глаза
        DrawDisc(-0.15f, 0.15f, 0.51f);
        DrawDisc(0.15f, 0.15f, 0.51f);

        GL.Color3(0.8f, 0f, 0f); // рот
        DrawSmile(0f, -0.10f, 0.51f, 0.17f);

        GL.PopMatrix();
    }

    // ───── маленькие вспомогательные фигуры ─────
    private static void DrawDisc(float x, float y, float z, float r = 0.05f, int seg = 12)
    {
        GL.PushMatrix();
        GL.Translate(x, y, z);
        GL.Begin(PrimitiveType.TriangleFan);
        GL.Vertex3(0, 0, 0);
        for (int i = 0; i <= seg; i++)
        {
            double a = i / (double)seg * Math.PI * 2;
            GL.Vertex3(Math.Cos(a) * r, Math.Sin(a) * r, 0);
        }

        GL.End();
        GL.PopMatrix();
    }

    private static void DrawSmile(float x, float y, float z, float r, int seg = 20)
    {
        GL.PushMatrix();
        GL.Translate(x, y, z);
        GL.Begin(PrimitiveType.TriangleFan);
        GL.Vertex3(0, 0, 0);
        for (int i = 0; i <= seg; i++)
        {
            double a = Math.PI + i / (double)seg * Math.PI; // нижняя полуокружность
            GL.Vertex3(Math.Cos(a) * r, Math.Sin(a) * r, 0);
        }

        GL.End();
        GL.PopMatrix();
    }
}