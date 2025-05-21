using OpenTK.Graphics.OpenGL4;
using OpenTK.Mathematics;
using OpenTK.Windowing.GraphicsLibraryFramework;

namespace KGRay
{
    public class CameraController
    {
        public Vector3 Position = new Vector3(0, 0, -9);
        public Vector3 Front = new Vector3(0, 0, 1);
        public Vector3 Up = new Vector3(0, 1, 0);
        public Vector3 Right => Vector3.Normalize(Vector3.Cross(Up, Front)); // Вправо

        private float _yaw = -90f;
        private float _pitch = 0f;
        private float _speed = 5.0f;
        private float _sensitivity = 0.1f;

        public void UpdateFromInput(KeyboardState keyboard, MouseState mouse, float deltaTime)
        {
            var offset = mouse.Delta;

            _yaw -= offset.X * _sensitivity;
            _pitch -= offset.Y * _sensitivity;
            _pitch = MathHelper.Clamp(_pitch, -89f, 89f);

            Vector3 direction;
            direction.X = MathF.Cos(MathHelper.DegreesToRadians(_yaw)) * MathF.Cos(MathHelper.DegreesToRadians(_pitch));
            direction.Y = MathF.Sin(MathHelper.DegreesToRadians(_pitch));
            direction.Z = MathF.Sin(MathHelper.DegreesToRadians(_yaw)) * MathF.Cos(MathHelper.DegreesToRadians(_pitch));
            Front = Vector3.Normalize(direction);

            Vector3 move = Vector3.Zero;
            if (keyboard.IsKeyDown(Keys.W)) move += Front;
            if (keyboard.IsKeyDown(Keys.S)) move -= Front;
            if (keyboard.IsKeyDown(Keys.A)) move -= Right;
            if (keyboard.IsKeyDown(Keys.D)) move += Right;

            if (move.LengthSquared > 0)
                Position += Vector3.Normalize(move) * _speed * deltaTime;
        }

        public void ApplyToShader(int programID)
        {
            int locPos = GL.GetUniformLocation(programID, "uCamera.Position");
            int locView = GL.GetUniformLocation(programID, "uCamera.View");
            int locUp = GL.GetUniformLocation(programID, "uCamera.Up");
            int locSide = GL.GetUniformLocation(programID, "uCamera.Side");
            int locScale = GL.GetUniformLocation(programID, "uCamera.Scale");

            Vector3 side = Vector3.Normalize(Vector3.Cross(Up, Front));
            Vector2 scale = new Vector2(1.0f);

            GL.Uniform3(locPos, Position);
            GL.Uniform3(locView, Front);
            GL.Uniform3(locUp, Up);
            GL.Uniform3(locSide, side);
            GL.Uniform2(locScale, scale);
        }
    }
}