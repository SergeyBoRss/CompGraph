using OpenTK.Windowing.Common;
using OpenTK.Windowing.Desktop;

namespace KGRay
{
    class Program
    {
        static void Main(string[] args)
        {
            string vertPath = "raytracing.vert";
            string fragPath = "raytracing.frag";
            

            if (!File.Exists(vertPath) || !File.Exists(fragPath))
            {
                Console.WriteLine("Ошибка: файлы шейдеров не найдены");
                return;
            }
            
            var nativeSettings = new NativeWindowSettings()
            {
                Size = new OpenTK.Mathematics.Vector2i(1000, 1000),
                Title = "Лабораторная работа 3: Трассировка лучей",
                Flags = ContextFlags.Default,
                Profile = ContextProfile.Core,
                APIVersion = new Version(4, 3)
            };
            
            using (var window = new RenderWindow(GameWindowSettings.Default, nativeSettings))
            {
                window.Run();
            }
        }
    }
}