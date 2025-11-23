using System;
using System.Diagnostics;
using System.IO;

class Program
{
    static void Main()
    {
        string htmlFile = Path.Combine(Directory.GetCurrentDirectory(), "index.html");
        
        if (File.Exists(htmlFile))
        {
            Console.WriteLine("Starting Cross Stitch Pattern Maker...");
            Process.Start(new ProcessStartInfo(htmlFile) { UseShellExecute = true });
        }
        else
        {
            Console.WriteLine("index.html not found in current directory");
        }
        
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
    }
}