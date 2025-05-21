using OpenTK.Graphics.OpenGL;
using OpenTK.Windowing.Common;
using OpenTK.Windowing.Desktop;
using OpenTK.Windowing.GraphicsLibraryFramework;


namespace KGRay
{
    class RenderWindow : GameWindow
    {
        private View _view;
        
        private CameraController _camera;
        
        public RenderWindow(GameWindowSettings gameWindowSettings, NativeWindowSettings nativeWindowSettings)
            : base(gameWindowSettings, nativeWindowSettings)
        {
            _view = new View();
        }

        protected override void OnLoad()
        {
            base.OnLoad();
            
            _view.InitShaders();
            _view.InitBuffer();
            
            _camera = new CameraController();
            
            CursorState = CursorState.Grabbed;

            GL.ClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        }
        
        protected override void OnUpdateFrame(FrameEventArgs args)
        {
            base.OnUpdateFrame(args);
            _camera.UpdateFromInput(KeyboardState, MouseState, (float)args.Time);
        }

        protected override void OnRenderFrame(FrameEventArgs args)
        {
            base.OnRenderFrame(args);

            GL.Clear(ClearBufferMask.ColorBufferBit);
            
            GL.UseProgram(_view.BasicProgramID);
            _camera.ApplyToShader(_view.BasicProgramID);
            
            GL.BindVertexArray(1); 
            
            GL.DrawArrays(PrimitiveType.TriangleFan, 0, 4);
            
            SwapBuffers();
        }

        protected override void OnResize(ResizeEventArgs e)
        {
            base.OnResize(e);
            GL.Viewport(0, 0, e.Width, e.Height);
        }
    }
}