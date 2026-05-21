using System;
using System.Threading.Tasks;

namespace B2B_V2.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<T> Repository<T>() where T : class;
        Task<int> CompleteAsync();
    }
}
