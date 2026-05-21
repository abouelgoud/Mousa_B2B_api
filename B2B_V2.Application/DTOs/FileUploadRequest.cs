using System.IO;

namespace B2B_V2.Application.DTOs
{
    public class FileUploadRequest
    {
        public string FileName { get; set; } = string.Empty;
        public Stream Content { get; set; } = Stream.Null;
        public string ContentType { get; set; } = string.Empty;
        public long Length { get; set; }
    }
}
