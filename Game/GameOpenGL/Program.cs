namespace GameOpenGL;

internal static class Program
{
    public static void Main()
    {
        using var game = new Game();
        game.Run();
    }
}