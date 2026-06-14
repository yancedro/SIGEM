package escalas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Crachá de Cão de Guarda Global
public class GlobalExceptionHandler {

    // Avisa que este método deve ser chamado sempre que uma RuntimeException for lançada
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {

        // Cria um formato JSON bonitinho e organizado
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value()); // Muda de 500 para 400
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage()); // A mensagem que escrevemos no Service (Ex: "SARAM já existe")

        // Retorna a mensagem para o Front-end
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}