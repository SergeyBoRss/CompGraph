using OpenTK.Graphics.OpenGL;
using OpenTK.Mathematics;

namespace KGRay
{
    internal class View
    {
        public int BasicProgramID;
        private int BasicFragmentShader;
        private int BasicVertexShader;
        private Vector3[] vertdata = Array.Empty<Vector3>();
        public int vbo_position;

        public void LoadShader(string filename, ShaderType type, int program, out int address)
        {
            address = GL.CreateShader(type);
            string shaderSource;
            using (StreamReader sr = new StreamReader(filename)) //
            {
                shaderSource = sr.ReadToEnd();
            }

            //установка исходного кода
            GL.ShaderSource((int)address, shaderSource);

            GL.CompileShader((int)address);
            //Проверка ошибок
            string infoLog = GL.GetShaderInfoLog((int)address);
            if (!string.IsNullOrEmpty(infoLog))
            {
                Console.WriteLine($"Ошибка в шейдере {filename}:\n{infoLog}");
            }

            //Прикрепление к программе
            GL.AttachShader(program, address);
        }

        public void InitShaders()
        {
            BasicProgramID = GL.CreateProgram();

            LoadShader("raytracing.vert",
                ShaderType.VertexShader, BasicProgramID, out BasicVertexShader);

            string vertexLog = GL.GetShaderInfoLog(BasicVertexShader);
            if (!string.IsNullOrEmpty(vertexLog))
            {
                Console.WriteLine("=== Vertex Shader Log ===");
                Console.WriteLine(vertexLog);
            }

            LoadShader("raytracing.frag",
                ShaderType.FragmentShader, BasicProgramID, out BasicFragmentShader);

            string fragmentLog = GL.GetShaderInfoLog(BasicFragmentShader);
            if (!string.IsNullOrEmpty(fragmentLog))
            {
                Console.WriteLine("=== Fragment Shader Log ===");
                Console.WriteLine(fragmentLog);
            }

            GL.LinkProgram(BasicProgramID);

            string programLog = GL.GetProgramInfoLog(BasicProgramID);
            if (!string.IsNullOrEmpty(programLog))
            {
                Console.WriteLine("=== Program Link Log ===");
                Console.WriteLine(programLog);
            }

            GL.GetProgram(BasicProgramID, GetProgramParameterName.LinkStatus, out int status);
            if (status == 0)
            {
                Console.WriteLine("=== Program Link Failed ===");
            }
        }

        public void InitBuffer()
        {
            vertdata = new Vector3[]
            {
                new Vector3(-1f, -1f, 0f),
                new Vector3(1f, -1f, 0f),
                new Vector3(1f, 1f, 0f),
                new Vector3(-1f, 1f, 0f)
            };

            int vao;
            GL.GenVertexArrays(1, out vao);
            GL.BindVertexArray(vao);

            GL.GenBuffers(1, out vbo_position);
            GL.BindBuffer(BufferTarget.ArrayBuffer, vbo_position);
            GL.BufferData(BufferTarget.ArrayBuffer, vertdata.Length * Vector3.SizeInBytes, vertdata,
                BufferUsageHint.StaticDraw);

            int attribute_vpos = GL.GetAttribLocation(BasicProgramID, "vPosition");
            GL.EnableVertexAttribArray(attribute_vpos);
            GL.VertexAttribPointer(attribute_vpos, 3, VertexAttribPointerType.Float, false, 0, 0);

            GL.BindBuffer(BufferTarget.ArrayBuffer, 0);
            GL.BindVertexArray(0);
        }
    }
}